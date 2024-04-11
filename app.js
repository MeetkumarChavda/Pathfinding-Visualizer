var cells;
const board  = document.querySelector("#board");


function renderBoard(cellWidth = 22){

    cells = [];
    let row = Math.floor(board.clientHeight / cellWidth) ;
    let col = Math.floor(board.clientWidth / cellWidth) ;
    // console.log(row , col)
   
    for (let r = 0 ; r < row ; r++ ) {
        const rowElement = document.createElement('div');
        rowElement.classList.add("row");
        rowElement.setAttribute('id',`${r}`); 

        for (let c = 0; c<col; c++) {   
            const colElement = document.createElement('div');
            colElement.classList.add("col");
            colElement.setAttribute('id',`${c}`);

            cells.push(colElement);
            rowElement.appendChild(colElement);
        }
        board.appendChild(rowElement);
    }
}
renderBoard();