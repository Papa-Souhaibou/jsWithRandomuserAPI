const addUserButton = document.getElementById("addUser");
const doublePriceButton = document.getElementById("doublePrice");
const displayMillionnaireButton = document.getElementById("displayMillionnaire");
const sortMillionnaireButton = document.getElementById("sortMillionnaire");
const calculateTotalButton = document.getElementById("calculateTotal");
const printTotalSpan = document.getElementById("printTotal");
const tbodyElt = document.querySelector("tbody");
const paginationElt = document.getElementById("pagination");
const numberOfUser = 20;
let userstab = [];
let pictureURLBeforeModification = "";

function User(apiUser,min=175000,max=589575) {
    return {
        picture:apiUser.picture.thumbnail,
        name :`${apiUser.name.first} ${apiUser.name.last}`,
        nationnalite:apiUser.nat,
        tel :apiUser.cell,
        money:Math.ceil(Math.random()*(max-min)+min)
    };

}

const getUsers = async (number = 1) => {
    let users = await fetch(`https://randomuser.me/api/?results=${number}`);
    users = await users.json();
    users = users.results;
    users.forEach(apiUser => {
        const newUser = new User(apiUser);
        userstab.unshift(newUser);
        addUser(newUser);
    });
    paginationElt.innerHTML = "";
    pagination(userstab, tbodyElt, row, currentPage);
    setPagination(userstab, paginationElt, row);
    activeFirstButton(paginationElt);
};

const activeFirstButton = (buttonWrapper, active = "active") => {
    let button = buttonWrapper.querySelector("button");
    if(button){
        button.classList.add("active");
    }
};
const addUser = user => {
    const trElt = document.createElement("tr");
    const firstTrElt = tbodyElt.querySelector("tr");
    const td = document.createElement("td");
    const checkbox = createCheckboxButton();
    checkbox.classList.add("mt-3");
    td.classList.add("text-center");
    td.appendChild(checkbox);
    trElt.appendChild(td);
    for (const key in user) {
        calculateTotal();
        const tdElt = document.createElement("td");
        if(key === "picture"){
            const divElt = document.createElement('div');
            const imgElt = document.createElement("img");
            divElt.setAttribute("class","text-center");
            imgElt.src = user[key];
            imgElt.style.width = "48px";
            imgElt.style.height = "48px";
            imgElt.setAttribute("class","rounded-lg");
            divElt.appendChild(imgElt)
            tdElt.appendChild(divElt);
        }else{
            tdElt.textContent = user[key];
        }
        trElt.appendChild(tdElt);

    }
    tbodyElt.appendChild(trElt);
    // tbodyElt.insertBefore(trElt,firstTrElt);
};

const createCheckboxButton = () => {
    const checkboxElt = document.createElement("input");
    checkboxElt.type = "checkbox";
    checkboxElt.addEventListener("click",event => {
        const row = event.target.parentElement.parentElement;
        if(event.target.checked){
            modifyThisRow(row);
        }else{
            setRowModification(row);
        }
    });
    return checkboxElt;
}

const doublePrice = () => {
    userstab = userstab.map(user => {
        user.money *= 2;
        return user;
    });
    refreshtab();
};

const refreshtab = () => {
    tbodyElt.innerHTML = "";
    for (const user of userstab) {
        addUser(user);
    }
    paginationElt.innerHTML = "";
    pagination(userstab, tbodyElt, row, currentPage);
    setPagination(userstab, paginationElt, row);
};

const displayMillionnaire = () => {
    userstab = userstab.filter((user) => user.money >= 1000000);
    refreshtab();
};

const sortMillionnaire = () => {
    userstab.sort((a,b) => {
        return b.money - a.money;
    });
    refreshtab();
};

const calculateTotal = () => {
    const reducer = (accumulator,currentValue) => accumulator + currentValue.money;
    const sum = userstab.reduce(reducer,0);
    printTotalSpan.textContent = sum;
};

let currentPage = 1;
let row = 5;
const pagination = (users,tbody,row_per_page,page) => {
    tbody.innerHTML = "";
    page--;
    let start = row_per_page * page;
    let end = start + row_per_page
    let usersItem = users.slice(start,start + end);
    for (let i = start; i < end; i++) {
        addUser(users[i]);
    }
};

const setPagination = (users, wrapper,row_per_page) => {
    let number_or_page = Math.ceil(users.length / row_per_page);
    for (let i = 1; i < number_or_page + 1; i++) {
        let button = setPaginationButton(i,users);
        wrapper.appendChild(button)
    }
    activeFirstButton(wrapper);
};

const setPaginationButton = (page,users) => {
    let buttonElt = document.createElement("button");
    buttonElt.classList.add("mr-1","rounded","border","border-secondary","pd-2");
    buttonElt.textContent = page;
    buttonElt.addEventListener("click",(event) => {
        event.preventDefault();
        let activeButton = paginationElt.querySelector(".active");
        if(activeButton){
            activeButton.classList.remove("active");
        }
        event.target.classList.add("active");
        currentPage = page;
        pagination(users, tbodyElt, row, currentPage);
    });
    return buttonElt;
};

const modifyThisRow = row => {
    const tdElts = row.querySelectorAll("td");
    const inputFileElt = document.createElement("input");
    inputFileElt.type = "file";
    pictureURLBeforeModification = tdElts[1].querySelector("img").src;
    tdElts[1].innerHTML = "";
    createPicture(inputFileElt,tdElts[1],"48px","48px");
    tdElts[1].appendChild(inputFileElt);
    for (let i = 2; i < tdElts.length; i++) {
        const content = tdElts[i].textContent;
        const input = document.createElement("input");
        input.value = content;
        input.style.width = "130px";
        tdElts[i].textContent = "";
        tdElts[i].appendChild(input);
    }
     
};

const createPicture = (fileElt,wrapper,width,height) => {
    const img = document.createElement("img");
    fileElt.addEventListener("change",() => {
        const pictueReader = new FileReader();
        pictueReader.readAsDataURL(fileElt.files[0]);
        pictueReader.onloadend = event => {
            img.setAttribute("src", event.target.result);
            img.style.width = width;
            img.style.height = height;
            wrapper.innerHTML = "";
            wrapper.appendChild(img);
        }
    });
};

const setRowModification = row => {
    const tdElts = row.querySelectorAll("td");
    let indexOfUser = 0;
    let user = {
        picture: "",
        name: "",
        nationnalite:"",
        tel: "",
        money: 0
    };
    let pictureURL = tdElts[1].querySelector("img").src;
    user.picture = pictureURL;
    if(pictureURLBeforeModification){
        for (let i = 0; i < userstab.length; i++) {
            if(userstab[i].picture == pictureURLBeforeModification){
                indexOfUser = i;
                break;
            }
        }
        for (let i = 2; i < tdElts.length; i++) {
            let inputContent = tdElts[i].querySelector("input").value;
            switch (i) {
                case 2:
                    user.name = inputContent;
                    break;
                case 3:
                    user.nationnalite = inputContent;
                    break;
                case 4:
                    user.tel = inputContent;
                    break;
                case 5:
                    inputContent = parseInt(tdElts[i].querySelector("input").value);
                    user.money = inputContent;
                    break;

            }
            tdElts[i].innerHTML = "";
            tdElts[i].textContent = inputContent;
        }
        for (const key in userstab[indexOfUser]) {
            userstab[indexOfUser][key] = user[key];
        }
    }
};

addUserButton.addEventListener("click",getUsers);
doublePriceButton.addEventListener("click",doublePrice);
displayMillionnaireButton.addEventListener("click", displayMillionnaire);
sortMillionnaireButton.addEventListener("click",sortMillionnaire);
calculateTotalButton.addEventListener("click",calculateTotal);
window.addEventListener("load",() => {
    getUsers(numberOfUser);
});

