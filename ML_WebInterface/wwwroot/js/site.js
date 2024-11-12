// Please see documentation at https://docs.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

let canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    mouse = { x: 0, y: 0 },
    draw = false;

context.strokeStyle = "black";
context.lineWidth = 12;

let inputPole = document.getElementById("lineWidth");

canvas.addEventListener("mousedown", function (e) {
    let ClientRect = this.getBoundingClientRect();
    mouse.x = e.clientX - ClientRect.left;
    mouse.y = e.clientY - ClientRect.top;
    draw = true;
    context.beginPath(); // начинаем рисовать
    context.moveTo(mouse.x, mouse.y);
});

canvas.addEventListener("mousemove", function (e) {
    if (draw === true) {
        let ClientRect = this.getBoundingClientRect();
        mouse.x = e.clientX - ClientRect.left;
        mouse.y = e.clientY - ClientRect.top;
        context.lineTo(mouse.x, mouse.y);
        context.stroke();
    }
});

canvas.addEventListener("mouseup", function (e) {
    let ClientRect = this.getBoundingClientRect();
    mouse.x = e.clientX - ClientRect.left;
    mouse.y = e.clientY - ClientRect.top;

    context.lineTo(mouse.x, mouse.y);
    context.stroke();
    context.closePath();

    draw = false;
});

window.addEventListener("load", function () {
    inputPole.value = context.lineWidth;

    // заполняем листы распознования 0
    let list = document.getElementById("list_simpleML");
    FillArrList(list);

    list = document.getElementById("list_Conv2DML");
    FillArrList(list);
});

function FillArrList(list) {
    list.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const row = document.createElement("li");
        row.textContent = "0.00";
        list.appendChild(row);
    }
}

const hubConnection = new signalR.HubConnectionBuilder()
    .withUrl("/DataRecognition")
    .build();

// запуск соединения
hubConnection.start()
    .then(function () {
        document.getElementById("btn_recognize").disabled = false; // делаем кнопку доступной для нажатия        
        //document.getElementById("btn_test").disabled = false;

        console.log("SignalR connected!");
    })
    .catch(function (err) {
        return console.error(err.toString());
    });

// получение данных от сервера
hubConnection.on("SimpleModel", function (Data) {
    console.log("SimpleModel recive data, data length: " + Data.length);

    let list = document.getElementById("list_simpleML");
    list.innerHTML = '';
    printResult(list, Data);
})

hubConnection.on("Conv2DModel", function (Data) {
    console.log("Conv2DModel recive data, data length: " + Data.length);

    let list = document.getElementById("list_Conv2DML");
    list.innerHTML = '';
    printResult(list, Data);
});

function printResult(list, Data) {
    for (let i = 0; i < Data.length; i++) {
        let row = document.createElement("li");
        row.textContent = (Data[i] * 100).toFixed(2);

        let light = map(Data[i], 0, 1, 0, 0.4);
        row.style = `background-color: rgb(0 128 0 / ${light})`;
        list.appendChild(row);
    }
}

// функция map примяком из arduino fraimwork )))
function map(x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

// евент кнопки btn_recognize
document.getElementById("btn_recognize").addEventListener("click", function () {
    //console.log("отправка данных на сервер\n");
    // здесь создать второй виртуальный канвас

    const canvas2 = document.getElementById("canvas2");
    ctx = canvas2.getContext("2d");

    ctx.clearRect(0, 0, canvas2.width, canvas2.height);     // всё стираем
    ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 28, 28); // загружаем новую картинку

    // подготовка данных
    const SendData = [];
    for (let i = 0; i < canvas2.width; i++) {
        for (let j = 0; j < canvas2.height; j++) {
            let pixel = ctx.getImageData(j, i, 1, 1);
            let DataPixel = pixel.data;

            //console.log(`R:${DataPixel[0]}, G:${DataPixel[1]}, B:${DataPixel[2]}, A:${DataPixel[3]}`);
            //console.log(`A:${DataPixel[3]}`);
            SendData.push(DataPixel[3] / 255);
        }
    }

    let flag = false;
    for (let i = 0; i < SendData.length; i++) {
        if (SendData[i] != 0) {
            flag = true;
            break;
        }
    }

    // первичная валидация на то что данные не пустны
    if (flag) {
        console.log("send data server leng: ", SendData.length);

        // отрисовка на странице, для дебага
        //let textOnPage = document.getElementById("text");
        //textOnPage.innerHTML = '';
        //let index = 0;
        //for (let i = 0; i < canvas2.width; i++) {
        //    for (let j = 0; j < canvas2.height; j++) {
        //        textOnPage.innerHTML += (SendData[index] / 255).toFixed(0) + ", ";
        //        index++;
        //    }
        //    textOnPage.innerHTML += "<br />";
        //}
        //textOnPage.innerHTML += "<br />";

        // отправка данных
        hubConnection
            .invoke("GetPrediction_SimpleML", SendData) // вызов простой нс
            .catch(function (err) {
                return console.error(err.toString());
            });

        hubConnection
            .invoke("GetPrediction2ConvML", SendData) // вызов сверточной нс
            .catch(function (err) {
                return console.error(err.toString());
            });
    }
});

document.getElementById("btn_clear").addEventListener("click", function () {
    //console.log("Очистка канваса");
    context.clearRect(0, 0, canvas.width, canvas.height);
});


// кнопка ввода новой ширины линии
document.getElementById("btn_apply_lineWidth").addEventListener("click", function () {
    context.lineWidth = inputPole.value;
    console.log("line Width: " + inputPole.value);
});


//document.getElementById("btn_test").addEventListener("click", function () {
//    console.log("test buntn click");
//    let str = "mes1";
//    hubConnection
//        .invoke("Method1_test", str)
//        .catch(function (err) {
//            return console.error(err.toString());
//        });
//});