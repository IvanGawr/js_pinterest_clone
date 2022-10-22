
// константы
const URL = 'https://634d8a61f34e1ed82678b251.mockapi.io/contekt';
const URLwithoutIgnorant = 'https://634d8a61f34e1ed82678b251.mockapi.io/contekt/?ignorant=false';
const dataAmount = 50;
const onScreenObjects = 12;
const hashtags = [
    'мужчина',
    'женщина',
    'ребенок',
    'красивый', 
    'урод',
    'богатый',
    'бедный',
    'плачет',
    'дединсайд',
    'плачет-плачет'
]
const contentBlock = 'div.main-content'

// запрос для получения данных
function GetData(){
    return new Promise((resolve, reject) => {
        fetch(URLwithoutIgnorant).then(response => {
            if(response.ok){
                resolve(response.json())
            } else {
                reject(new Error('Some Error here '))
            }
        })
    })
}

function GetByDesk(desk){
    return GetData().then(data => data.filter((element) => {
        element.hasOwnProperty('desks') && element.desks.find((e) => e == desk)
    }))
}

// запрос для изменения данных (игнорирование контента)
function PutIgnorant(obj){
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ignorant: true}),
    }
    return new Promise((resolve, reject) => {
        fetch(URL + '/' + obj.id, options).then(response => {
            if(response.ok){
                resolve(response.json())
            } else {
                reject(new Error('Some Error here '))
            }
        })
    })
}

function PutInDesk(obj, desk){
    let objDesks = []
    if (obj.hasOwnProperty('desks')){
        objDesks = obj.desks
        if (!obj.desks.find( (element) => element == desk)){   
            objDesks.push(desk)
        }
    } else {
        objDesks.push(desk)
    }
    
    const options = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({desks: objDesks}),
    }
    return new Promise((resolve, reject) => {
        fetch(URL + '/' + obj.id, options).then(response => {
            if(response.ok){
                resolve(response.json())
            } else {
                reject(new Error('Some Error here '))
            }
        })
    })
}

function PutHashtags(){
    const maxHastags = 5
    const GetHastagsAmount = () => Math.floor(Math.random() * (maxHastags - 1)) + 1;
    const GetRandomHashtag = () => Math.floor(Math.random() * (hashtags.length));
    const GetRandomHastags = () => {
        let maxHastags = GetHastagsAmount()
        let thisHashtags = [];
        while(thisHashtags.length < maxHastags){
            let randomHashtag = hashtags[GetRandomHashtag()]
            if (!thisHashtags.find( (value) => value == randomHashtag)){
                thisHashtags.push(randomHashtag)
            }
        }
        return thisHashtags
    }

    GetData()
        .then(data => {
            data.forEach( (element) => {
                if (!element.hasOwnProperty('hashtags')){
                    const options = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({hashtags: GetRandomHastags()}),
                    }
                    fetch(URL + '/' + element.id, options)
                        .then(response => response.json())
                }
            })
        })
}

// получение случайных индексов
function Shuffle(data){ 
    for (let i = data.length - 1; i > 0; i--){
        let j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
    }
    return data
}

// создание всех объектов
function CreateObjects(data){
    let amount = 0;
    for(let i = 0; i < data.length && amount < onScreenObjects; i++, amount++){
        CreateObject(data[i]);
    }
}

// создание одного объекта
function CreateObject(object){
    let body = document.querySelector(contentBlock);
    let picture = document.createElement('div');
    
    let pictureImg = document.createElement('img');
    let pictureDescription = document.createElement('p');
    let author = document.createElement('div');
    let authorPhoto = document.createElement('img');
    let authorName = document.createElement('p');

    let buttonReport = document.createElement('button')
    buttonReport.textContent = 'X';
    let buttonAdd = document.createElement('button')
    buttonAdd.textContent = 'O';
    buttonAdd.addEventListener("click", function() {
        let modalWin = document.querySelector("div.main-popup-desks")
        modalWin.style = "display: block"

        modalWin.childNodes.forEach( element => element.addEventListener("click", function() {
            PutInDesk(object, element.value)
            console.log(object)
            console.log(element.value)
            modalWin.style = "display: none"
        }))
    })
    
    buttonReport.addEventListener("click", function() {
        let modalWin = document.querySelector("div.main-popup-report")
        modalWin.style = "display: block"

        document.querySelector("button.button__cancel").addEventListener("click", function() {
            modalWin.style = "display: none"
        })
    
        document.querySelector("button.button__send").addEventListener("click", function() {
            PutIgnorant(object)
            currentContent.then(data => data.splice(data.indexOf(data.find( (element) => element.id == object.id)), 1))
            ClearObjects()
            currentContent.then(data => CreateObjects(data))
            modalWin.style = "display: none"
        })
    })

    // повесить классы 
    pictureImg.classList.add('main_picture')
    buttonAdd.classList.add('main-content-button__add')

    pictureImg.setAttribute("src", object.img)
    pictureDescription.textContent = object.description;
    authorPhoto.setAttribute("src", object.user.img);
    authorName.textContent = object.user.name;

    author.appendChild(authorPhoto);
    author.appendChild(authorName);
    picture.appendChild(pictureImg);
    picture.appendChild(buttonReport)
    picture.appendChild(buttonAdd) 
    picture.appendChild(pictureDescription);
    picture.appendChild(author);
    body.appendChild(picture);
}

function ClearObjects(){
    const body = document.querySelector(contentBlock);
    for(let i = 0; i < body.childNodes.length; i++){
        if (body.childNodes[i].nodeType===1){
            body.removeChild(body.childNodes[i--]);
        }
    }
}

// исполняемый код
// левая кнопка дома
document.querySelector('button.header-homelink').addEventListener("click", function() {
    ClearObjects();
    const deskSelector = document.getElementById('desk_selector')
    deskSelector.selectedIndex = 0
    currentContent = GetData()
    currentContent.then(data => CreateObjects(Shuffle(data)))
})

// фильтр поиска
document.querySelector('form.header-search-form').addEventListener("submit", function(event) {
    ClearObjects();
    const input = document.getElementById('search_input')
    if (input.value == ''){
        currentContent.then(data => CreateObjects(Shuffle(data)))
    } else {
        const filteredData = currentContent.then(data => data.filter((element) => element.hasOwnProperty('hashtags') && element.hashtags.find((hashtag) => hashtag == input.value)))
        filteredData.then(data => CreateObjects(Shuffle(data)))
    }  
    event.preventDefault()
})

// таблицы
const desklist = document.querySelector('select.header-desklist-wrapper-select')
desklist.addEventListener("change", function() {
    ClearObjects();  
    currentContent = GetData().then(data => data.filter( (obj) => obj.hasOwnProperty('desks') && obj.desks.find( (desk) => desk == desklist.value)))
    currentContent.then(data => CreateObjects(Shuffle(data)))
})

//PutHashtags()
var currentContent = GetData()
currentContent.then(data => CreateObjects(Shuffle(data)))


/*

const filterForm = document.querySelector('form.header-search-form')
filterForm.onsubmit = function(){
    ClearObjects();
    const input = document.getElementById('search_input')
    if (input.value == ''){
        currentContent.then(data => CreateObjects(Shuffle(data)))
    } else {
        const filteredData = currentContent.then(data => data.filter((element) => element.hasOwnProperty('hashtags') && element.hashtags.find((hashtag) => hashtag == input.value)))
        filteredData.then(data => CreateObjects(Shuffle(data)))
    }  
    return false;
}

*/