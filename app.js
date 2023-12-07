const express = require('express')

const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => console.log('success'))
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

app.get('/players/', async (request, response) => {
  const playerQuery1 = `
    SELECT 
    *
    FROM
    cricket_team;`
  const playerArray = await db.all(playerQuery1)
  response.send(playerArray.map((i) => convertDBObjectToResponseObject(i)))
})

app.post('/players/', async (request, response) => {
  const detailsOfDB = request.body
  const {playerName, jerseyNumber, role} = detailsOfDB
  const addPlayerQuery = ` 
        INSERT INTO
        cricket_team (player_name, jersey_number, role)
        VALUES
        (
            '${playerName}',
            '${jerseyNumber}',
            '${role}'
        );`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playerQuery2 = `
        SELECT
        *
        FROM
        cricker_team
        WHERE
        player_id = ${playerId};`
  const dbResponse = await db.get(playerQuery2)
  response.send(convertDBObjectToResponse(dbResponse))
})

app.put('players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const detailsOfDB = request.body
  const {playerName, jerseyNumber, role} = detailsOfDB
  const playerQuery3 = `
        UPDATE
            cricket_team
        SET
           player_name= '${playerName}',
           jersey_number= '${jerseyNumber}',
           role= '${role}'
        WHERE
            player_id=${playerId};
    `
  await db.run(playerQuery3)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const playerQuery4 = ` 
        DELETE
        FROM
            cricket_team
        Where
            player_id = ${playerId}; 
    `
  await db.run(playerQuery4)
  response.send('Player Removed')
})
module.exports = app
