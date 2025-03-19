const WIDTH = 800;
const HEIGHT = 500;
const DPI_WIDTH = WIDTH*2;
const DPI_HEIGHT = HEIGHT*2;
const VIEW_HEIGHT_START = DPI_HEIGHT/8;
const VIEW_WIDTH_START = DPI_WIDTH/8;
const VIEW_HEIGHT_END = DPI_HEIGHT - DPI_HEIGHT/8;
const VIEW_WIDTH_END = DPI_WIDTH - DPI_WIDTH/8;
const CYRCLE_RADIUS = 8;

ctx = document.getElementById("chart").getContext('2d');
var interpolation = chart(document.getElementById('chart'), null);
var textInput = 'null';
var textInput1 = 'null';
var MatrPoints;
var argument;
var txt = document.getElementById("block").textContent;

id_textarea.addEventListener("keyup", event => {
    textInput = id_textarea.value;
    MatrPoints = masFromInput();
    interpolation = chart(document.getElementById('chart'), MatrPoints);
    interpolation.init();
});
id_text.addEventListener("keyup", event => {
    textInput1 = id_text.value;
    argument = varFromInput();
});


function chart(canvas, MatrPoints)
{
    canvas.style.width = WIDTH + 'px';
    canvas.style.height = HEIGHT + 'px';
    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT;
    
    function paint()
    {
        if (MatrPoints && MatrPoints.length != 0)
        {
            ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT);

            // строят оси СК и перемещают точку (0, 0) в их пересечение.
            var xMax = MatrPoints[MatrPoints.length - 1][0];
            var xMin = MatrPoints[0][0];
            var singleSegmentX = 1;
            if ((xMax - xMin) != 0) singleSegmentX = (VIEW_WIDTH_END - VIEW_WIDTH_START) / (xMax - xMin);
            var X_Center = yAxis(ctx, xMin, xMax, singleSegmentX); 

            var minmaxY = minMaxY(MatrPoints); 
            var singleSegmentY = 1;
            if ((minmaxY[1] - minmaxY[0]) != 0) singleSegmentY = (VIEW_HEIGHT_END - VIEW_HEIGHT_START) / (minmaxY[1] - minmaxY[0]);
            var Y_Center = xAxis(ctx, minmaxY[0], minmaxY[1], singleSegmentY, X_Center); 

            if (X_Center == VIEW_WIDTH_START)  ctx.translate(-xMin * singleSegmentX, 0);
            else if (X_Center == VIEW_WIDTH_END) ctx.translate(-xMax * singleSegmentX, 0);
            if (Y_Center == VIEW_HEIGHT_END) ctx.translate(0, minmaxY[0] * singleSegmentY);
            else if (Y_Center == VIEW_HEIGHT_START) ctx.translate(0, minmaxY[1] * singleSegmentY);

            pointsOnPloat(ctx, singleSegmentX, singleSegmentY, MatrPoints, X_Center, Y_Center, xMin, xMax, minmaxY[0], minmaxY[1]);
        }
    }   
    return {
        init()
        {
            paint();
        }
    }
}

id_button1.addEventListener("click", event => {
    interpolation = chart(document.getElementById('chart'), MatrPoints);
    interpolation.init();
    document.getElementById("block").textContent = "Здесь будет значение функции f(x) в указанной точке (x)";
})
id_button2.addEventListener("click", event => {
    linerIterV20(ctx, MatrPoints, argument);
})
id_button3.addEventListener("click", event => {
    spline2(ctx, MatrPoints, argument);
})
id_button4.addEventListener("click", event => {
    spline3(ctx, MatrPoints, argument);
})
id_button5.addEventListener("click", event => {
    Newton(ctx, MatrPoints, argument);
})

// Взятие данных из textarea и преобразование их в матрицу nх2 + сортировка по x-ам
function masFromInput()
{
    var mas = [];
    var j = 0;
    for (let i = 0; i < textInput.length; i++)
    {
        if ((textInput[i] != "\n") && (textInput[i] != " "))
        {
            var temp = '';
            for (; (((textInput[i] != "\n") && (textInput[i] != ' ')) && (i < textInput.length)); i++)
            {
                temp += textInput[i];
            }
            var num = parseFloat(temp);
            mas[j] = num;
            j++;
            temp = '';
        }
    }
    if (!mas) return null;
    return matrPoints(mas);
    
}
function matrPoints(mas)
{
    if (mas.length % 2 != 0) return null;
    else 
    {
        let n = mas.length / 2;
        var Matr = [];
        for (let i = 0, j = 0; i < n; i++, j++)
        {
            Matr[i] = [];
            Matr[i][0] = mas[j];
            j++;
            Matr[i][1] = mas[j];
           
        }
        quickSort(Matr, n);
        // Удаление одинаковых элементов по x
        for (let i = 1; i < n; i++)
        {
            if (Matr[i][0] == Matr[i - 1][0]) 
            {
                Matr[i - 1][0] = null;
            }
        }
        var MatrPoints = [];
        for (let i = 0, j = 0; i < n; i++)
        {
            if (Matr[i][0] != null) 
            {
                MatrPoints[j] = [];
                MatrPoints[j][0] = Matr[i][0];
                MatrPoints[j][1] = Matr[i][1];
                j++;
            }
        }
        return MatrPoints;
    }
}

// Быстрая сортировка
function sortQuick(Matr, L, R)
{
	let i = L, j = R;
	let m = Matr[Math.floor((L + R) / 2)][0];
	do
	{
		for (; Matr[i][0] < m; i++);
		for (; Matr[j][0] > m; j--);
		if (i <= j)
		{
			let tmp = Matr[i][0]; Matr[i][0] = Matr[j][0]; Matr[j][0] = tmp;
			let tmp1 = Matr[i][1]; Matr[i][1] = Matr[j][1]; Matr[j][1] = tmp1;
			i++; j--;
		}
	} while (i <= j);
	if (L < j) sortQuick(Matr, L, j);
	if (i < R) sortQuick(Matr, i, R);
}
function quickSort(Matr, n)
{
    if (Matr && Matr.length != 0)
    {
	sortQuick(Matr, 0, n - 1);
    }
}

// Построение СК
function yAxis(ctx, xMin, xMax, singleSegment)
{
    if (xMin >= 0) { strokeYaxis(ctx, VIEW_WIDTH_START); return VIEW_WIDTH_START; }
    if (xMax <= 0) { strokeYaxis(ctx, VIEW_WIDTH_END); return VIEW_WIDTH_END; }
    else 
    {
        for (let i = xMin, j = 0; i <= xMax; i++, j++)
        {
            if (Math.abs(i) <= 0.5)
            {
                strokeYaxis(ctx, singleSegment * j + VIEW_WIDTH_START);
                return singleSegment * j + VIEW_WIDTH_START;
            }
        }
    }   
}
function strokeYaxis(ctx, x) 
{
    ctx.beginPath();

    ctx.lineWidth = 1
    ctx.strokeStyle = '#000';
    ctx.font = 'normal 20px Helventica,sans-serif';

    ctx.translate(x, 0);
    ctx.moveTo(0, 0);
    ctx.lineTo(0, DPI_HEIGHT);
    

    // стрелочка
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, 10);
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 10);
    const textY = "Y";
    ctx.fillText(textY.toString(), -25, 20);

    ctx.stroke();
    ctx.closePath();
}
function xAxis(ctx, yMin, yMax, singleSegment, X_Center)
{
    if (yMin >= 0) { strokeXaxis(ctx, VIEW_HEIGHT_END, X_Center);  return VIEW_HEIGHT_END; }
    if (yMax <= 0) { strokeXaxis(ctx, VIEW_HEIGHT_START, X_Center); return VIEW_HEIGHT_START; }
    else 
    {
        for (let i = yMin, j = 0; i <= yMax; i++, j++)
        {
            if (Math.abs(i) <= 0.5)
            {
                strokeXaxis(ctx, VIEW_HEIGHT_END - singleSegment * j, X_Center);
                return VIEW_HEIGHT_END - singleSegment * j;
            }
        }
    }
}
function strokeXaxis(ctx, y, X_Center)
{
    ctx.beginPath();

    ctx.translate(0, y);
    ctx.moveTo(-X_Center, 0);
    ctx.lineTo(DPI_WIDTH - X_Center, 0);

    // стрелочка
    ctx.moveTo(DPI_WIDTH - X_Center, 0);
    ctx.lineTo(DPI_WIDTH - X_Center - 10, 10);
    ctx.moveTo(DPI_WIDTH - X_Center, 0);
    ctx.lineTo(DPI_WIDTH - X_Center - 10, -10);
    const textX = "X";
    ctx.fillText(textX.toString(), DPI_WIDTH - X_Center - 20, 30);

    ctx.stroke();
    ctx.closePath();
}

// функция минимума и максимума для y
function minMaxY(MatrPoints)
{
    var minmaxY = [];
    minmaxY[0] = MatrPoints[0][1];
    minmaxY[1] = MatrPoints[0][1];
    for (let i = 1; i < MatrPoints.length; i++)
    {
        if (MatrPoints[i][1] > minmaxY[1]) minmaxY[1] = MatrPoints[i][1];
        else if (MatrPoints[i][1] < minmaxY[0]) minmaxY[0] = MatrPoints[i][1];
    }
    return minmaxY;
}

// Рисует точки на плоскости и чёрточки на осях
function pointsOnPloat(ctx, ssX, ssY, MatrPoints, X_Center, Y_Center, xMin, xMax, yMin, yMax,)
{
    for (let i = 0; i < MatrPoints.length; i++)
    {
        if (i > 0 && MatrPoints[i][0] == MatrPoints[i - 1][0] && MatrPoints[i][1] == MatrPoints[i - 1][1]);
        else
        {
            ctx.beginPath();
            //X
            if (Y_Center == VIEW_HEIGHT_END) ctx.translate(0, -yMin * ssY);
            else if (Y_Center == VIEW_HEIGHT_START) ctx.translate(0, -yMax * ssY);
            const text1 = (MatrPoints[i][0]);
            ctx.fillText(text1.toString(), MatrPoints[i][0] * ssX - 15, 28);
            ctx.moveTo(MatrPoints[i][0] * ssX, -10);
            ctx.lineTo(MatrPoints[i][0] * ssX, 10);
            ctx.stroke();
            if (Y_Center == VIEW_HEIGHT_END) ctx.translate(0, yMin * ssY);
            else if (Y_Center == VIEW_HEIGHT_START) ctx.translate(0, yMax * ssY);
            //Y
            if (X_Center == VIEW_WIDTH_START)  ctx.translate(xMin * ssX, 0);
            else if (X_Center == VIEW_WIDTH_END) ctx.translate(xMax * ssX, 0);
            const text2 = (MatrPoints[i][1]);
            ctx.fillText(text2.toString(), 15, -MatrPoints[i][1] * ssY + 7);
            ctx.moveTo(-10, -MatrPoints[i][1] * ssY);
            ctx.lineTo(10, -MatrPoints[i][1] * ssY);
            if (X_Center == VIEW_WIDTH_START)  ctx.translate(-xMin * ssX, 0);
            else if (X_Center == VIEW_WIDTH_END) ctx.translate(-xMax * ssX, 0);
            //points
            ctx.moveTo(MatrPoints[i][0] * ssX, -MatrPoints[i][1] * ssY);
            ctx.stroke();
            ctx.closePath();
            ctx.beginPath();
            ctx.fillStyle = '#96a2aa';
            ctx.arc(MatrPoints[i][0] * ssX, -MatrPoints[i][1] * ssY, CYRCLE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
            // пунктирные линии
            ctx.beginPath();
            ctx.strokeStyle = '#bbb';
            ctx.setLineDash([4, 8]);
            ctx.moveTo(MatrPoints[i][0] * ssX, -MatrPoints[i][1] * ssY);
            ctx.lineTo(MatrPoints[i][0] * ssX, 0);
            ctx.moveTo(MatrPoints[i][0] * ssX, -MatrPoints[i][1] * ssY);
            ctx.lineTo(0, -MatrPoints[i][1] * ssY);
            ctx.stroke();
            ctx.closePath();
            ctx.strokeStyle = '#000';
            ctx.setLineDash([0, 0]);
        }
    }
}

// получение значения x из 2ой textarea
function varFromInput()
{
    var x = null;
    for (let i = 0; i < textInput1.length; i++)
    {
        if ((textInput1[i] != "\n") && (textInput1[i] != " "))
        {
            var temp = '';
            for (; (((textInput1[i] != "\n") && (textInput1[i] != ' ')) && (i < textInput1.length)); i++)
            {
                temp += textInput1[i];
            }
            x = parseFloat(temp);
            break;
        }
    }
    if (!x) return null;
    return x;
}

// Линейная интерполяция
function linerIter(ctx, MatrPoints)
{
    if (MatrPoints.length > 1)
    {
        var ssX = xSingleSegment(MatrPoints);
        var ssY = ySingleSigment(MatrPoints);
        ctx.beginPath();
        for (let i = 0; i < MatrPoints.length - 1; i++)
        {
            ctx.moveTo(MatrPoints[i][0] * ssX, -MatrPoints[i][1] * ssY);
            ctx.lineTo(MatrPoints[i + 1][0] * ssX, -MatrPoints[i + 1][1] * ssY);
        }
        ctx.stroke();
        ctx.closePath();
    }
}

// Линейная интерполяция по сплайнам
function Linercoef(MatrPoints)
{
    var coef = [];
    for (let i = 0; i < MatrPoints.length - 1; i++)
    {
        coef[i] = [];
    }
    for (let i = 0; i < MatrPoints.length - 1; i++)
    {
        let k, b, x1, x2, y1, y2;
        x1 = MatrPoints[i][0];
        x2 = MatrPoints[i + 1][0];
        y1 = MatrPoints[i][1];
        y2 = MatrPoints[i + 1][1];
        b = (x2 * y1 - x1 * y2) / (x2 - x1);
        k = (y2 - y1) / (x2 - x1);
        coef[i][0] = b;
        coef[i][1] = k;
    }
   
    return coef;
}
function linerIterV20(ctx, MatrPoints, argument)
{
    var ssX = xSingleSegment(MatrPoints);
    var ssY = ySingleSigment(MatrPoints);
    var step = 1;
    let flag = true;
    if (ssX < 1) step = ssX;
    else step = 1 / ssX;
    if (MatrPoints.length > 1)
    {
        var coef = [];
        for (let i = 0; i < MatrPoints.length - 1; i++)
        {
            coef[i] = [];
        }
        coef = Linercoef(MatrPoints);
        for (let i = 0; i < coef.length; i++)
        {
            for (let j = MatrPoints[i][0]; j < MatrPoints[i + 1][0]; j+=step)
            {
                ctx.beginPath();
                ctx.strokeStyle = '#0fb300';
                var x = j;
                var y = -(coef[i][0] + coef[i][1] * x);
                ctx.arc(x*ssX, y*ssY, 1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
                if (MatrPoints[i][0] <= argument && argument < MatrPoints[i + 1][0] && flag) 
                {
                    var valueArg = (coef[i][0] + coef[i][1] * argument);
                    document.getElementById("block").textContent = "При X = " + argument + " значение функции Y = " + valueArg.toFixed(2);
                    drowPoint(ctx, argument, valueArg, ssX, ssY, '#0fb300');
                    flag = false;
                }
            }
        }
        if (flag) document.getElementById("block").textContent = "Значение X = " + argument + " находится вне диапазона!";
    }
}

// Интерполяция квадратичными сплайнами
function doublecoef(MatrPoints)
{
    var coef = [];
    for (let i = 0; i < MatrPoints.length - 1; i++)
    {
        coef[i] = [];
    }
    for (let i = 0; i < MatrPoints.length - 1; i++)
    {
        let a, b, c, x1, x2, y1, y2, cnst;
        x1 = MatrPoints[i][0];
        x2 = MatrPoints[i + 1][0];
        y1 = MatrPoints[i][1];
        y2 = MatrPoints[i + 1][1]; 
        if  (i == 0) cnst = 0; // (константа) значение 1ой производной прошлого сплайна в точке i;
        else cnst = 2 * coef[i - 1][2] * x1 + coef[i - 1][1]; // coef[i - 1][j] - значение коеффициентов у прошлого сплайна.
        a = ((y2 - y1) / ((x2 - x1) ** 2)) - (cnst / (x2 - x1));
        b = ((y2 - y1) - a * (x2 ** 2 - x1 ** 2)) / (x2 - x1); 
        c = y1 - a * x1 ** 2 - b * x1;
        coef[i][2] = a;
        coef[i][1] = b;
        coef[i][0] = c;
    }
    return coef;
}
function spline2(ctx, MatrPoints, argument)
{
    {
        var ssX = xSingleSegment(MatrPoints);
        var ssY = ySingleSigment(MatrPoints);
        var step = 1;
        let flag = true;
        if (MatrPoints.length > 1)
        {
            var coef = [];
            for (let i = 0; i < MatrPoints.length - 1; i++)
            {
                coef[i] = [];
            }
            coef = doublecoef(MatrPoints);
            for (let i = 0; i < MatrPoints.length - 1; i++)
            {
                step = (MatrPoints[i + 1][0] - MatrPoints[i][0]) / 1500;
                for (let j = MatrPoints[i][0]; j < MatrPoints[i + 1][0]; j+=step)
                {
                    ctx.beginPath();
                    ctx.strokeStyle = '#0050c0';
                    var x = j;
                    var y = -(coef[i][2] * x * x + coef[i][1] * x + coef[i][0]);
                    ctx.arc(x*ssX, y*ssY, 1, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.closePath();
                    if (MatrPoints[i][0] <= argument && argument < MatrPoints[i + 1][0] && flag) 
                    {
                        var valueArg = (coef[i][2] * argument ** 2 + coef[i][1] * argument + coef[i][0]);
                        document.getElementById("block").textContent = "При X = " + argument + " значение функции Y = " + valueArg.toFixed(2);
                        drowPoint(ctx, argument, valueArg, ssX, ssY, '#0050c0');
                        flag = false;
                    }
                }
            }
            if (flag) document.getElementById("block").textContent = "Значение X = " + argument + " находится вне диапазона!";
        }
    }
}

// Интерполяция кубическими сплайнами
function triplecoef(MatrPoints)
{
    var coef = [];
    for (let i = 0; i < MatrPoints.length - 1; i++)
    {
        coef[i] = [];
    }
    for (let i = 0; i < MatrPoints.length - 1; i++)
    {   
        let a, b, c, d, x1, x2, y1, y2, cnst1, cnst2;
        x1 = MatrPoints[i][0];
        x2 = MatrPoints[i + 1][0];
        y1 = MatrPoints[i][1];
        y2 = MatrPoints[i + 1][1];
        if  (i == 0) cnst1 = 0, cnst2 = 0; // (константы) значение 1ой и 2ой производной прошлого сплайна в точке i;
        else 
        {
            x0 = MatrPoints[i - 1][0];
            cnst1 = (3 * coef[i - 1][3] * ((x1 - x0) ** 2) + 2 * coef[i - 1][2] * (x1 - x0) + coef[i - 1][1]);
            cnst2 = -(6 * coef[i - 1][3] * (x1 - x0) + 2 * coef[i - 1][2]); // coef[i - 1][j] - значение коеффициентов у прошлого сплайна.
        }
        d = y1;
        c = cnst1;
        b = cnst2 / 2;
        a = (y2 - d - c * (x2 - x1) - b * ((x2 - x1) ** 2)) / (((x2 - x1) ** 3));
        coef[i][3] = a;
        coef[i][2] = b;
        coef[i][1] = c;
        coef[i][0] = d;
    }
    return coef;
}
function spline3(ctx, MatrPoints, argument)
{
    var ssX = xSingleSegment(MatrPoints);
    var ssY = ySingleSigment(MatrPoints);
    var step = 1;
    let flag = true;
    if (MatrPoints.length > 1)
    {
        var coef = [];
        for (let i = 0; i < MatrPoints.length - 1; i++)
        {
            coef[i] = [];
        }
        coef = triplecoef(MatrPoints);
        console.log(coef);              
        for (let i = 0; i < MatrPoints.length - 1; i++)
        {
            step = (MatrPoints[i + 1][0] - MatrPoints[i][0]) / 2000;
            x0 = MatrPoints[i][0];
            console.log(step);
            for (let j = x0; j < MatrPoints[i + 1][0]; j+=step)
            {
                ctx.beginPath();
                ctx.strokeStyle = '#bb0000';
                var x = j;
                var y = -(coef[i][3] * ((x - x0) ** 3) + coef[i][2] * ((x - x0) ** 2) + coef[i][1] * (x - x0) + coef[i][0]);
                ctx.arc(x*ssX, y*ssY, 1, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();

                if (MatrPoints[i][0] <= argument && argument < MatrPoints[i + 1][0] && flag) 
                {
                    var valueArg = (coef[i][3] * ((argument - x0) ** 3) + coef[i][2] * ((argument - x0) ** 2) + coef[i][1] * (argument - x0) + coef[i][0]);
                    document.getElementById("block").textContent = "При X = " + argument + " значение функции Y = " + valueArg.toFixed(2);
                    drowPoint(ctx, argument, valueArg, ssX, ssY, '#bb0000');
                    flag = false;
                }
            }
            if (flag) document.getElementById("block").textContent = "Значение X = " + argument + " находится вне диапазона!";
        }
    }
}

// Интерполяция многочленом Ньютона
function dividedDifference(MatrPoints, n)
{
    let sum = 0, product;
    for (let j = 0; j <= n; j++)
    {
        product = 1;
        for (let i = 0; i <= n; i++)
        {
            if (i != j)
            {
                product *= (MatrPoints[j][0] - MatrPoints[i][0]);
            }
        }
        sum += (MatrPoints[j][1] / product);
    }
    return sum;
}
function Newton(ctx, MatrPoints, argument)
{
    var ssX = xSingleSegment(MatrPoints);
    var ssY = ySingleSigment(MatrPoints);
    var step = 1;
    if (MatrPoints.length > 1)
    {
        step = (MatrPoints[MatrPoints.length - 1][0] - MatrPoints[0][0]) / (VIEW_WIDTH_END - VIEW_WIDTH_START);
        step *= 0.1;
        for (let j = MatrPoints[0][0]; j < MatrPoints[MatrPoints.length - 1][0]; j+=step)
        {
            ctx.beginPath();
            ctx.strokeStyle = '#d77301';
            var x = j;
            let sum, product;
            sum = 0;
            for (let k = 1; k <= MatrPoints.length - 1; k++)
            {
                product = 1;
                for (let i = 0; i <= (k - 1); i++)
                {
                    product *= (x - MatrPoints[i][0]);
                }
                sum += dividedDifference(MatrPoints, k) * product;
            }
            var y = -(MatrPoints[0][1] + sum);
            ctx.arc(x*ssX, y*ssY, 1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.closePath();
        }
        if (argument)
        {
            let sumArg, productArg;
            sumArg = 0;
            for (let k = 1; k <= MatrPoints.length - 1; k++)
            {
                productArg = 1;
                for (let i = 0; i <= (k - 1); i++)
                {
                    productArg *= (argument - MatrPoints[i][0]);
                }
                sumArg += dividedDifference(MatrPoints, k) * productArg;
            }
            var valueArg = (MatrPoints[0][1] + sumArg);
            document.getElementById("block").textContent = "При X = " + argument + " значение функции Y = " + valueArg.toFixed(2);
            drowPoint(ctx, argument, valueArg, ssX, ssY, '#d77301');
        }
    }
}

//Расчёт коэффициентов связывающих координаты в СК с реальными значениями высоты и ширины
function xSingleSegment(MatrPoints)
{
    var xMax = MatrPoints[MatrPoints.length - 1][0];
    var xMin = MatrPoints[0][0];
    var ssX = 1;
    if ((xMax - xMin) != 0) ssX = (VIEW_WIDTH_END - VIEW_WIDTH_START) / (xMax - xMin);
    return ssX;
}
function ySingleSigment(MatrPoints)
{
    var minmaxY = minMaxY(MatrPoints); 
    var ssY = 1;
    if ((minmaxY[1] - minmaxY[0]) != 0) ssY = (VIEW_HEIGHT_END - VIEW_HEIGHT_START) / (minmaxY[1] - minmaxY[0]);
    return ssY;
}

function drowPoint(ctx, x, y, ssX, ssY, color)
{
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x * ssX, -y * ssY, CYRCLE_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}