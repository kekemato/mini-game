class Game {
    constructor() {
        this.boardXLength = 9
        this.boardYLength = 10

        this.initialBoardContainer = (
            Array(this.boardYLength)
                .fill(1)
                .map(el => (
                    Array(this.boardXLength)
                        .fill(1)
                ))
        )

        this.boardContainer = null

        this.initialPlayerPosition = {
            x: 4,
            y: 9
        }
        this.playerPosition = this.initialPlayerPosition

        this.obstacles = [{
            x: 2,
            y: 0
        }]
        this.scoreBoard = JSON.parse(localStorage.getItem('ePla-game')) || []
        this.scoreContainer = document.querySelector('.score')
        this.score = 0

        this.gameInterval = null

        this.timeElapsed = 0

        // must be multiply of 10
        this.tickSpeed = 10
        this.timeToGenerateObstacle = 800
        this.timeToMoveObstacle = 400
        this.timeToSpeedUp = 10000
        this.level = 0

        this.gameFlexContainer = document.querySelector('.game-flex-container')
        this.instructionContainer = document.querySelector('.game-instruction')
        this.buttonsContainer = document.querySelector('.buttons-container')
        this.startGameButton = document.querySelector('.start-game-button')

        this.init()
    }

    init() {
        this.startGameButton.addEventListener('click', () => {
            this.gameFlexContainer.removeChild(this.instructionContainer)
            this.startGameInterval()
            this.deleteStartButton()
            this.createArrowButtons()
        })
        this.startListeningToArrows()
        this.render()
    }

    deleteStartButton(){
        this.buttonsContainer.removeChild(this.startGameButton)
    }

    createArrowButtons() {
        const buttonLeft = document.createElement('button')
        const buttonRight = document.createElement('button')

        buttonLeft.innerText = '<--'
        buttonRight.innerText = '-->'

        buttonLeft.setAttribute("class", "button button-left")
        buttonRight.setAttribute("class", "button button-right")

        buttonLeft.addEventListener('click', () => this.checkIfMoveIsAvailable(-1, 0))
        buttonRight.addEventListener('click', () => this.checkIfMoveIsAvailable(1, 0))

        this.buttonsContainer.appendChild(buttonLeft)
        this.buttonsContainer.appendChild(buttonRight)
    }

    render() {
        const gameBoardContainer = document.querySelector('.game-board-container')
        gameBoardContainer.innerHTML = ''

        this.composeBoard()
        this.boardContainer.forEach((row, i) => {
            const rowDiv = document.createElement('div')
            rowDiv.style.height = '6vh'

            row.forEach((cell, j) => {
                this.renderSingleCell(cell, rowDiv)
            })
            gameBoardContainer.appendChild(rowDiv)
        })
    }

    renderSingleCell(cell, rowDiv) {
        const cellDiv = document.createElement('div')

        cellDiv.style.display = "inline-block"
        cellDiv.style.width = '6vh'
        cellDiv.style.height = '6vh'

        if (cell === 0) cellDiv.style.backgroundColor = 'green'
        if (cell === 1) cellDiv.style.backgroundColor = 'rgb(242, 242, 242)'
        if (cell === 'P') cellDiv.style.backgroundColor = 'rgb(242, 242, 242)'
        if (cell === 'P') cellDiv.style.backgroundImage = "url('./img/car.png')"
        if (cell === 'P') cellDiv.style.backgroundSize = "contain"

        rowDiv.appendChild(cellDiv)
    }

    composeBoard() {
        this.boardContainer = JSON.parse(JSON.stringify(this.initialBoardContainer))

        this.obstacles.forEach(obstacle => {
            this.boardContainer[obstacle.y][obstacle.x] = 0
        })

        this.boardContainer[this.playerPosition.y][this.playerPosition.x] = 'P'
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    startGameInterval() {
        return setInterval(
            () => {
                this.gameTick()
            },
            this.tickSpeed
        )
    }

    gameTick() {
        this.timeElapsed = this.timeElapsed + this.tickSpeed

        this.scoreUp()
        this.renderScore()

        if (this.timeElapsed % this.timeToMoveObstacle === 0) this.moveObstaclesDown()
        if (this.timeElapsed % this.timeToGenerateObstacle === 0) {
            this.generateObstacle()
            this.generateObstacle()
        }
        if (
            this.timeElapsed % this.timeToSpeedUp === 0 &&
            this.level < 3
        ) this.speedUp()

        this.render()
    }

    speedUp() {
        this.level++
        this.timeToGenerateObstacle = this.timeToGenerateObstacle / 2
        this.timeToMoveObstacle = this.timeToMoveObstacle / 2
    }

    generateObstacle() {
        const obstacleXPosition = this.getRandomInt(0, this.boardXLength - 1)
        this.obstacles = this.obstacles.concat({
            x: obstacleXPosition,
            y: 0
        })
    }

    checkIfObstacleMoveIsAvailable(predictedObstaclePosition) {
        if (predictedObstaclePosition.y > this.boardYLength - 1) {
            return false
        }
        if (
            predictedObstaclePosition.x === this.playerPosition.x &&
            predictedObstaclePosition.y === this.playerPosition.y
        ) {
            this.gameEnd()
            return false
        }
        return true
    }

    moveObstaclesDown() {
        this.obstacles = this.obstacles.filter((obstacle => {
            const predictedObstaclePosition = {
                x: obstacle.x,
                y: obstacle.y + 1
            }
            return this.checkIfObstacleMoveIsAvailable(predictedObstaclePosition)
        }))
            .map(obstacle => ({
                x: obstacle.x,
                y: obstacle.y + 1
            }))
    }

    startListeningToArrows() {
        window.addEventListener(
            'keydown',
            event => {
                switch (event.key) {
                    case 'ArrowRight':
                        event.preventDefault
                        this.checkIfMoveIsAvailable(1, 0)
                        break
                    case 'ArrowLeft':
                        event.preventDefault
                        this.checkIfMoveIsAvailable(-1, 0)
                        break;
                }
            }
        )
    }

    checkIfMoveIsAvailable(deltaX, deltaY) {
        const newPlayerPosition = {
            x: this.playerPosition.x + deltaX,
            y: this.playerPosition.y + deltaY
        }

        if (
            this.boardContainer[newPlayerPosition.y] &&
            this.boardContainer[newPlayerPosition.y][newPlayerPosition.x]
        ) {
            this.move(newPlayerPosition)
        }
    }

    move(newPlayerPosition) {
        this.playerPosition = newPlayerPosition
        this.render()
    }

    scoreUp() {
        this.score++
    }

    renderScore() {
        this.scoreContainer.innerText = `Score: ${this.score}`
    }

    updateScoreBoard() {
        this.scoreBoard = this.scoreBoard.concat(this.score)
        this.scoreBoard.sort((a, b) => b - a)
        if (this.scoreBoard.length > 10) {
            this.scoreBoard.pop()
        }
        localStorage.setItem('ePla-game', `${JSON.stringify(this.scoreBoard)}`)
    }

    displayScoreboard() {
        alert(`YOU LOST!

        Your Scores:
        ${this.scoreBoard.map((element, index) => `${index + 1}. ${element}
        `).join('')
            }`)
    }

    gameEnd() {
        this.updateScoreBoard()
        this.displayScoreboard()
        window.location = ''
    }
}
