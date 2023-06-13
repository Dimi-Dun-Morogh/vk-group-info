const bootstrap = require('bootstrap');
import api from './api';
class UI {
  app = document.querySelector('#app');

  intervalId: NodeJS.Timer;

  fetchBtn = document.querySelector('#FETCH') as HTMLButtonElement;

  wipeRoot() {
    this.app.innerHTML = '';
  }

  async popEnv() {
    try {
      const data = await api.envStatus();
      const tokenSt = document.getElementById('vk-token');
      const grpSt = document.getElementById('vk-grp-id');
      tokenSt.innerHTML = data.vk_token ? 'OK' : 'NOT SET';
      grpSt.innerHTML = data.vk_grp_id ? data.vk_grp_id : 'NOT SET';
    } catch (error) {
      console.error(error);
    }
  }

  async initialScreen() {
    this.NavBtnsState();
    this.toggleSpinner();
    const data = await api.dataStatus();
    this.toggleSpinner();
    this.wipeRoot();
    let html = '';
    if (!data || !data.text.length) {
      html = `<h1 class="text-center">ДАМП С ПОСТАМИ ЕЩЕ НЕ СОЗДАН. НАЖМИТЕ ФЕТЧ ПОСТОВ</h1>
        `;
    } else {
      html = `
      <div class="d-flex justify-content-center">
      <img src="${data.img}"/>
      </div>
      <h1 class="text-center">${data.text}</h1>

      `;
    }
    this.app.innerHTML = `
    <div class="align-self-center flex-fill">
    ${html}
    </div>
    `;
  }

  fetchScreen() {
    this.wipeRoot();
    const months = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ];

    const datenow = new Date();

    const html = `
    <div class="d-flex align-items-center container flex-column pt-5">
    <div class="container d-flex justify-content-center fetch-posts">
    <div class="mx-5 mt-3">
    <h3 class="text-center">Дата старта</h3>
<div class="flex-row align-items-start d-flex">
<div class="input-group input-group-sm mb-3 " style="max-width:120px">
  <span class="input-group-text" id="inputGroup-sizing-sm">Год</span>
  <input type="number" id="startYear" value="${datenow.getFullYear()}" class="form-control " aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
</div>

<div class="input-group input-group-sm mb-3">
  <span class="input-group-text" id="inputGroup-sizing-sm">Месяц</span>
  <select id="startMonth" class="form-select form-select-sm" aria-label=".form-select-sm example">
  ${months.reduce((acc, el, index) => {
    acc += `<option ${datenow.getMonth() == index ? 'selected' : ''} value="${
      index + 1
    }">${el}</option>`;
    return acc;
  }, '')}
</select>
</div>

<div class="input-group input-group-sm mb-3" style="max-width:120px">
  <span class="input-group-text" id="inputGroup-sizing-sm">День</span>
  <input type="number" id="startDay" value="01" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
</div>

</div>
</div>

<div class="mx-5 mt-3">
<h3 class="text-center">Дата конца</h3>
<div class="flex-row align-items-start d-flex">
<div class="input-group input-group-sm mb-3 " style="max-width:120px">
<span class="input-group-text" id="inputGroup-sizing-sm">Год</span>
<input type="number" id="endYear" value="${datenow.getFullYear()}" class="form-control " aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
</div>

<div class="input-group input-group-sm mb-3">
<span class="input-group-text" id="inputGroup-sizing-sm">Месяц</span>
<select id="endMonth" class="form-select form-select-sm" aria-label=".form-select-sm example">
${months.reduce((acc, el, index) => {
  acc += `<option ${datenow.getMonth() == index ? 'selected' : ''} value="${
    index + 1
  }">${el}</option>`;
  return acc;
}, '')}
</select>
</div>

<div class="input-group input-group-sm mb-3" style="max-width:120px">
<span class="input-group-text" id="inputGroup-sizing-sm">День</span>
<input type="number" id="endDay" value="01" class="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-sm">
</div>

</div>
</div>

</div>
<button type="button" id="FETCH_POSTS" class="btn btn-primary w-25 mt-5">ОК</button>
</div>
`;
    this.app.innerHTML = html;
    //this.toggleButtonState('#FETCH');
    this.NavBtnsState('#FETCH');
    document
      .getElementById('FETCH_POSTS')
      .addEventListener('click', this.fetchBtnHandler.bind(this));
  }

  private NavBtnsState(id?: string) {
    const allBtns = document.querySelectorAll('.navbar button');
    allBtns.forEach((el) => el.classList.remove('active'));
    if (id) {
      this.toggleButtonState(id);
    }
  }

  toggleButtonState(id: string) {
    //remove active class from nav buttons first;
    const allBtn = document.querySelectorAll('.navbar .btn');
    allBtn.forEach((el) => el.classList.remove('active'));
    const btn = bootstrap.Button.getOrCreateInstance(id);
    btn.toggle();
  }

  buttonListener() {
    const buttons: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll('button');
    buttons.forEach((el) =>
      el.addEventListener('click', () => {
        const id = el.id;
        switch (id) {
          case 'FETCH':
            this.fetchScreen();
            break;
          default:
            console.log(el);
            break;
        }
      }),
    );
  }

  private digitConverter(num: string) {
    if (num.length > 1) return num;
    return '0' + num;
  }

  async fetchBtnHandler() {
    const data = {} as { [key: string]: string };

    const inputs = document.querySelectorAll(
      '.fetch-posts input, select',
    ) as NodeListOf<HTMLInputElement>;
    inputs.forEach((el) => {
      data[el.id] = this.digitConverter(el.value);
    });
    const { startYear, startDay, startMonth, endDay, endMonth, endYear } = data;
    const dateString = `${startYear}-${startMonth}-${startDay}T00:00 ${endYear}-${endMonth}-${endDay}T23:59`;
    await api.fetchPosts(dateString);
    // launch spinner
    this.toggleSpinner();
    this.intervalId = setInterval(async () => {
      const offsetNdate = await api.offsetStatus();
      const [date, offset] = offsetNdate.split('&');
      const nodeToast = document.getElementById('myToast');
      const toast = bootstrap.Toast.getOrCreateInstance(nodeToast);
      nodeToast.querySelector(
        '.toast-body',
      ).innerHTML = `Дата текущего поста - ${date}  оффсет - ${offset}`;

      if (offset === 'DONE') {
        clearInterval(this.intervalId);
        this.toggleSpinner();
        this.initialScreen();
      }
      toast.show();
      console.log(offset);
    }, 5000);
  }

  toggleSpinner() {
    const spinner = document.querySelector('.wrap-spinner');
    spinner.classList.toggle('d-none');
  }
}

export default UI;
