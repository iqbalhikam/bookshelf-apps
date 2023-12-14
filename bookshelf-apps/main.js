document.addEventListener('DOMContentLoaded', function () {
const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    cariBuku();
  });

  function cariBuku() {
    const judulCari = document.getElementById('searchBookTitle').value.toLowerCase();

    // Cari buku pada rak belum selesai
    Array.from(incompleteBookshelfList.children).forEach((elemenBuku) => {
      const judul = elemenBuku.querySelector('h3').innerText.toLowerCase();
      elemenBuku.style.display = judul.includes(judulCari) ? 'block' : 'none';
    });

    // Cari buku pada rak sudah selesai
    Array.from(completeBookshelfList.children).forEach((elemenBuku) => {
      const judul = elemenBuku.querySelector('h3').innerText.toLowerCase();
      elemenBuku.style.display = judul.includes(judulCari) ? 'block' : 'none';
    });
  }

  const inputForm = document.getElementById('inputBook');
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  const completeBookshelfList = document.getElementById('completeBookshelfList');

  inputForm.addEventListener('submit', function (event) {
    event.preventDefault();
    tambahBuku();
  });

  function tambahBuku() {
    const judulInput = document.getElementById('inputBookTitle').value;
    const penulisInput = document.getElementById('inputBookAuthor').value;
    const tahunInput = document.getElementById('inputBookYear').value;
    const sudahSelesaiInput = document.getElementById('inputBookIsComplete').checked;

    if (judulInput === '' || penulisInput === '' || tahunInput === '') {
      alert('Harap isi semua kolom.');
      return;
    }

    const buku = {
      id: generateTimestampId(),
      title: judulInput,
      author: penulisInput,
      year: parseInt(tahunInput),
      isComplete: sudahSelesaiInput,
    };

    if (sudahSelesaiInput) {
      tambahKeRakSelesai(buku);
    } else {
      tambahKeRakBelumSelesai(buku);
    }

    updateLocalStorage();
    inputForm.reset();
  }

  function generateTimestampId() {
    return Date.now().toString();
  }

  function tambahKeRakBelumSelesai(buku) {
    const elemenBuku = buatElemenBuku(buku);
    const tombolAksi = elemenBuku.querySelector('.action');
    const tombolSelesai = document.createElement('button');
    tombolSelesai.innerText = 'Selesai dibaca';
    tombolSelesai.classList.add('green');
    tombolSelesai.addEventListener('click', function () {
      pindahkanBukuKeSelesai(buku);
    });

    tombolAksi.appendChild(tombolSelesai);
    incompleteBookshelfList.appendChild(elemenBuku);
  }

  function tambahKeRakSelesai(buku) {
    const elemenBuku = buatElemenBuku(buku);
    const tombolAksi = elemenBuku.querySelector('.action');
    const tombolBelumSelesai = document.createElement('button');
    tombolBelumSelesai.innerText = 'Belum selesai di Baca';
    tombolBelumSelesai.classList.add('red');
    tombolBelumSelesai.addEventListener('click', function () {
      pindahkanBukuKeBelumSelesai(buku);
    });

    tombolAksi.appendChild(tombolBelumSelesai);
    completeBookshelfList.appendChild(elemenBuku);
  }

  function buatElemenBuku(buku) {
    const elemenBuku = document.createElement('article');
    elemenBuku.classList.add('book_item');
    elemenBuku.id = `book_${buku.id}`;

    const judul = document.createElement('h3');
    judul.innerText = buku.title;

    const penulis = document.createElement('p');
    penulis.innerText = `Penulis: ${buku.author}`;

    const tahun = document.createElement('p');
    tahun.innerText = `Tahun: ${buku.year}`;

    const tombolAksi = document.createElement('div');
    tombolAksi.classList.add('action');

    const tombolHapus = document.createElement('button');
    tombolHapus.innerText = 'Hapus buku';
    tombolHapus.classList.add('red');
    tombolHapus.addEventListener('click', function () {
      hapusBuku(buku);
    });

    tombolAksi.appendChild(tombolHapus);

    elemenBuku.appendChild(judul);
    elemenBuku.appendChild(penulis);
    elemenBuku.appendChild(tahun);
    elemenBuku.appendChild(tombolAksi);

    return elemenBuku;
  }

  function pindahkanBukuKeSelesai(buku) {
    tambahKeRakSelesai(buku);
    hapusBukuDariBelumSelesai(buku);
    updateLocalStorage();
  }

  function pindahkanBukuKeBelumSelesai(buku) {
    hapusBukuDariSelesai(buku);
    tambahKeRakBelumSelesai(buku);
    updateLocalStorage();
  }

  function hapusBuku(buku) {
    hapusBukuDariBelumSelesai(buku);
    hapusBukuDariSelesai(buku);
    updateLocalStorage();
  }

  function hapusBukuDariBelumSelesai(buku) {
    const elemenBuku = document.getElementById(`book_${buku.id}`);
    if (elemenBuku && elemenBuku.parentNode === incompleteBookshelfList) {
      incompleteBookshelfList.removeChild(elemenBuku);
    }
  }

  function hapusBukuDariSelesai(buku) {
    const elemenBuku = document.getElementById(`book_${buku.id}`);
    if (elemenBuku && elemenBuku.parentNode === completeBookshelfList) {
      completeBookshelfList.removeChild(elemenBuku);
    }
  }

  function updateLocalStorage() {
    const belumSelesai = Array.from(incompleteBookshelfList.children).map(parseDataBuku);
    const sudahSelesai = Array.from(completeBookshelfList.children).map(parseDataBuku);

    localStorage.setItem('belumSelesai', JSON.stringify(belumSelesai));
    localStorage.setItem('sudahSelesai', JSON.stringify(sudahSelesai));
  }

  function parseDataBuku(elemenBuku) {
    const judul = elemenBuku.querySelector('h3').innerText;
    const penulis = elemenBuku.querySelector('p:nth-child(2)').innerText.slice(8);
    const tahun = parseInt(elemenBuku.querySelector('p:nth-child(3)').innerText.slice(7));
    const isComplete = elemenBuku.querySelector('.action button').innerText === 'Belum selesai di Baca';

    return {
      id: elemenBuku.id.split('_')[1],
      title: judul,
      author: penulis,
      year: tahun,
      isComplete,
    };
  }

  // Muat buku dari localStorage saat halaman dimuat
  function muatBukuDariLocalStorage() {
    const belumSelesai = JSON.parse(localStorage.getItem('belumSelesai')) || [];
    const sudahSelesai = JSON.parse(localStorage.getItem('sudahSelesai')) || [];

    belumSelesai.forEach((buku) => {
      tambahKeRakBelumSelesai(buku);
    });

    sudahSelesai.forEach((buku) => {
      tambahKeRakSelesai(buku);
    });
  }

  muatBukuDariLocalStorage();
});
