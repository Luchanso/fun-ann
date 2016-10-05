const synaptic = require('synaptic')
const readline = require('readline')
const fs = require('fs')

/*
  First two bits - player,
  Second two bits - network
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

const network = new Architect.Perceptron(2, 6, 6, 2)
const trainer = new Trainer(network)

const game = {
  rock: [1, 0], // 1
  scissors: [1, 1], // 2
  paper: [0, 1], // 3

  playerIsWin: (player, compare) => {
    if (player === 1 && compare === 1) return 0.5
    if (player === 1 && compare === 2) return 1
    if (player === 1 && compare === 3) return 0

    if (player === 2 && compare === 1) return 0
    if (player === 2 && compare === 2) return 0.5
    if (player === 2 && compare === 3) return 1

    if (player === 3 && compare === 1) return 1
    if (player === 3 && compare === 2) return 0
    if (player === 3 && compare === 3) return 0.5
  },

  convertToGameData: data => {
    if (data[0] === 1 && data[1] === 0) return 1
    if (data[0] === 1 && data[1] === 1) return 2
    if (data[0] === 0 && data[1] === 1) return 3
  },

  convertToBits: data => {
    if (data === 1) return game.rock
    if (data === 2) return game.scissors
    if (data === 3) return game.paper
  },

  getWinCombination: data => {
    if (data === 1) return 3
    if (data === 2) return 1
    if (data === 3) return 2
  }
}

let lastPlayerResult = [0, 0];
let gameData = [
  'win; draw; lose'
]

let drawCounter = 0;
let winCounter = 0;
let loseCounter = 0;

function dise(playerGameResult) {
  let playerResult = game.convertToBits(playerGameResult)
  let winCombination = game.getWinCombination(playerGameResult)

  let networkResult = network.activate(lastPlayerResult)
  console.log(networkResult)
  networkResult = networkResult.map(Math.round)
  network.propagate(0.35, game.convertToBits(winCombination))

  let result = game.playerIsWin(game.convertToGameData(playerResult), game.convertToGameData(networkResult))

  if (result === 1) {
    winCounter++
    console.log(`w: ${winCounter} d: ${drawCounter} l: ${loseCounter} `)
  }
  if (result === 0.5) {
    drawCounter++
    console.log(`w: ${winCounter} d: ${drawCounter} l: ${loseCounter} `)
  }
  if (result === 0) {
    loseCounter++
    console.log(`w: ${winCounter} d: ${drawCounter} l: ${loseCounter} `)
  }

  gameData.push(`${winCounter};${drawCounter};${loseCounter}`)

  lastPlayerResult = playerResult
}

function play() {
  rl.question('1:rock, 2:scissors, 3:paper\r\n', (answer) => {
    answer = Number.parseInt(answer)
    if (answer < 0 || answer > 3) {
      console.log('not correct enter');
      return play()
    }
    dise(answer)

    fs.writeFile('data.json', JSON.stringify(network.toJSON()))
    fs.writeFile('gameData.json', JSON.stringify(gameData))

    play()
  })
}

play()
