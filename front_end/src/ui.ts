const bootstrap = require('bootstrap');
import api, { PostStatResp } from './api';
class UI {
  app = document.querySelector('#app');

  grpId = '';

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
      this.grpId = data.vk_grp_id;
    } catch (error) {
      console.error(error);
    }
  }

  async initialScreen() {
    this.NavBtnsState('#MAIN');
    this.toggleSpinner();
    const data = await api.dataStatus();
    this.toggleSpinner();
    this.wipeRoot();
    let html = '';
    if (!data || !data.status.length) {
      html = `<h1 class="text-center">ДАМП С ПОСТАМИ ЕЩЕ НЕ СОЗДАН. НАЖМИТЕ ФЕТЧ ПОСТОВ</h1>
        `;
        this.disableNav()
    } else {
      this.enableNav()
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

  async topCommentatorScreen() {
    try {
      this.NavBtnsState('#TOP_COMMENT');
      this.wipeRoot();
      const data = await api.topCommentator();

      if ('err' in data) {
        this.toggleSpinner();
        await api.countComments();
        this.intervalId = setInterval(async () => {
          const dataC = await api.topCommentator();
          if (!('err' in dataC)) {
            this.toggleSpinner();
            this.topCommentatorScreen();
            clearInterval(this.intervalId);
          }
        }, 5000);
        return;
      }

      const html = `

      <div class="container-fluid col-md-12 my-3 d-flex flex-column align-items-center">
      <h5>ТОП КОММЕНТАТОРОВ\n${data.dates}</h5>
      <div class="col-md-8  tbodyDiv" >
      <table class="table table-bordered table-dark table-striped text-center align-middle">
      <thead class="sticky-top">
        <tr>
          <th scope="col">Место</th>
          <th scope="col">Комментатор</th>
          <th scope="col">Комментариев</th>
        </tr>
      </thead>
      <tbody>
        ${data.data.reduce((acc, el, index) => {
          acc += `
          <tr>
          <th scope="row">${index + 1}</th>
          <td class="text-start fw-bold author-col"><img class="rounded-circle  mx-5" style="height:50px" src="${
            el.avatar
          }"/>
          ${el.Комментатор}
          </td>
          <td>${el.Комментариев}</td>
        </tr>
          `;
          return acc;
        }, '')}
      </tbody>
    </table>
        </div>

    </div>
      `;
      this.app.innerHTML = html;
    } catch (error) {
      console.error(error);
    }
  }

  private topPostsTable(data:PostStatResp, filter:'likes'|'comments') {
    const isLikes = filter == 'likes';
    const html = `


    <div class="col-md-10" >
    <h5 class="text-center">ТОП ПОСТОВ ПО ${isLikes? 'ЛАЙКАМ' : 'КОММЕНТАМ' } ${data.dates}</h5>
    <div class="tbodyDiv">
    <table class="table table-bordered table-dark table-striped text-center align-middle" >
    <thead class="sticky-top">
      <tr>
        <th scope="col">Место</th>
        <th scope="col"> ${isLikes? 'Лайков' : 'Комментов' } </th>
        <th scope="col">${isLikes? 'Комментов' : 'Лайков' }</th>
        <th scope="col">Автор поста</th>
        <th scope="col">Дата/ссылка</th>
      </tr>
    </thead>
    <tbody>
      ${data.data.reduce((acc, el, index) => {
        const postLink = `https://vk.com/club${this.grpId.slice(1)}?w=wall${el.ссылка}`
        acc += `
        <tr>
        <th scope="row">${index + 1}</th>

        <td>${isLikes? el.Лайков: el.Комментариев}</td>
        <td>${!isLikes? el.Лайков: el.Комментариев}</td>
        <td class="text-start author-col fw-bold"><img class="rounded-circle  mx-5" style="height:50px" src="${
          el.avatar
        }"/>
        <span>
        ${el['Автор поста']}
        </span>
        </td>
        <td>${el['Дата поста']} <a href="${postLink}"> ${el.ссылка.slice(10)}</a></td>
      </tr>
        `;
        return acc;
      }, '')}
    </tbody>
  </table>
  </div>
      </div>
    `;
    return html;
  }

  async topPostsScreen() {
    try {
      this.wipeRoot();
      this.NavBtnsState('#TOPPOSTS');
      this.toggleSpinner()
      const { likes, comments } = await api.topPosts();
      this.toggleSpinner()
      const html = `

      <div class="container-fluid col-md-12 my-3 d-flex flex-column align-items-center">
     ${this.topPostsTable(likes, 'likes')}
     ${this.topPostsTable(comments, 'comments')}

    </div>
      `;
      this.app.innerHTML = html;
    } catch (error) {
      console.error(error);
    }
  }

  async topPostersScreen() {
    try {
      this.wipeRoot();
      this.toggleSpinner();
      this.toggleButtonState('#TOPPOSTERS');
      const data = await api.topPosters();
      this.toggleSpinner();

      const html = `

      <div class="container-fluid col-md-12 my-3 d-flex flex-column align-items-center">
      <div class="col-md-10" >
      <h5 class="text-center"> ТОП 20 ПОЛЬЗОВАТЕЛЕЙ ПО НАПИСАННЫМ ПОСТАМ | КОММЕНТЫ И ЛАЙКИ НА ПОСТАХ АВТОРА
${data.dates}</h5>
      <div  class="tbodyDiv">
      <table class="table table-bordered table-dark table-striped text-center align-middle" >
      <thead class="sticky-top">
        <tr>
          <th scope="col">Место</th>
          <th scope="col">Постов </th>
          <th scope="col">Автор </th>
          <th scope="col">Комментов</th>
          <th scope="col">Лайков</th>
        </tr>
      </thead>
      <tbody>
        ${data.data.reduce((acc, el, index) => {
          acc += `
          <tr>
          <th scope="row">${index + 1}</th>

          <td>${el.ПОСТОВ}</td>
          <td class="text-start fw-bold author-col"><img class="rounded-circle  mx-5" style="height:50px" src="${
            el.avatar
          }"/>
          ${el['имя автора']}
          </td>
          <td>${el.КОМЕНТОВ}</td>
          <td>${el.ЛАЙКОВ}</td>

        </tr>
          `;
          return acc;
        }, '')}
      </tbody>
    </table>
    </div>
        </div>
    </div>
      `;
      this.app.innerHTML = html;
    } catch (error) {
      console.error(error)
    }
  }

  private enableNav() {
    const allBtns = document.querySelectorAll('.navbar button');
    allBtns.forEach(el=>el.classList.remove('disabled'))
  }

  private disableNav() {
    const allBtns = document.querySelectorAll('.navbar button');
    allBtns.forEach(el=>{
      if(el.id =='FETCH' || el.id =='MAIN') return;
       el.classList.toggle('disabled')
    })
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

  navButtonListener() {
    const buttons: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll('button');
    buttons.forEach((el) =>
      el.addEventListener('click', () => {
        const id = el.id;
        switch (id) {
          case 'FETCH':
            this.fetchScreen();
            break;
          case 'TOP_COMMENT':
            this.topCommentatorScreen();
            break;
          case 'MAIN':
            this.initialScreen();
            break;
          case 'TOPPOSTS':
            this.topPostsScreen();
            break;
            case 'TOPPOSTERS':
              this.topPostersScreen();
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
