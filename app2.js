const synaptic = require('synaptic')
const fs = require('fs')

/*
  First two bits - player,
  Second two bits - network
 */

const Neuron = synaptic.Neuron,
    Layer = synaptic.Layer,
    Network = synaptic.Network,
    Trainer = synaptic.Trainer,
    Architect = synaptic.Architect;

const network1 = new Architect.Perceptron(2, 6, 6, 2)
const network2 = new Architect.Perceptron(2, 6, 6, 2)
const trainer1 = new Trainer(network1)
const trainer2 = new Trainer(network2)
const rate = 0.00001

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

let network1Score = 0
let network2Score = 0

let n1Last = [1, 1]
let n2Last = [1, 1]

let gameData = [
  'network 1,network 2'
]

function diseN1(data) {
  let winCombination = game.getWinCombination(game.convertToGameData(data))
  let networkResult = network1.activate(data).map(Math.round)
  let result = game.playerIsWin(
    game.convertToGameData(data),
    game.convertToGameData(networkResult)
  )

  network1.propagate(rate, game.convertToBits(winCombination))

  switch (result) {
    case 0:
      network1Score += 0;
      network2Score += 1;
    break
    case 0.5:
      network1Score += 0.5;
      network2Score += 0.5;
    break
    case 1:
      network1Score += 1;
      network2Score += 0;
    break
  }

  gameData.push(`${network1Score},${network2Score}`)

  return networkResult
}

function diseN2(data) {
  let winCombination = game.getWinCombination(game.convertToGameData(data))
  let networkResult = network2.activate(data).map(Math.round)
  let result = game.playerIsWin(
    game.convertToGameData(data),
    game.convertToGameData(networkResult)
  )

  network2.propagate(rate, game.convertToBits(winCombination))

  switch (result) {
    case 0:
      network1Score += 0;
      network2Score += 1;
    break
    case 0.5:
      network1Score += 0.5;
      network2Score += 0.5;
    break
    case 1:
      network1Score += 1;
      network2Score += 0;
    break
  }

  gameData.push(`${network1Score},${network2Score}`)

  return networkResult
}

function run() {
  iterations = 300

  for (var i = 0; i < iterations; i++) {
    if (i == 0) {
      n1Last = diseN1([1, 1])
      n2Last = diseN2([1, 1])
    } else {
      n1Last = diseN1(n2Last)
      n2Last = diseN2(n1Last)
    }
    console.log(network1Score, network2Score)
  }

  let data = gameData.reduce((str1, str2) => {
    return str1 + '\r\n' + str2
  })
  fs.writeFile('gameData.csv', data)
}

run();
