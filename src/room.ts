import moment from "moment";
import { Player } from "./types";

const roomList: any[] = [];

let uniqueId = 1;

let currentRoom: any = null;

export const createRoom = () => {
  let startDate = moment();
  if (moment().hour() >= 14) {
    startDate = moment().add(1, 'd');
  }
  const startTime = moment(startDate.format('YYYY-MM-DD') + ' 15:00:00');
  console.log('startTime', startTime)
  const room = {
    id: uniqueId++,
    players: new Array<Player>(),
    state: 0,
    createdAt: new Date(),
    startTime: startTime, //moment().add(1, 'm'),
  };
  roomList.push(room);
  return room;
}

export const getRoom = () => {
  if (!currentRoom || currentRoom.state !== 0) {
    currentRoom = createRoom();
  }
  return currentRoom;
}

export const closeRoom = (id) => {
  const index = roomList.findIndex(i => i.id === id);
  if (index >= 0) {
    roomList.splice(index, 1);
  }
}

export const findRoom = (id) => {
  return roomList.find(i => i.id === id);
}

export const joinRoom = (roomId, player) => {
  const room = findRoom(roomId);
  if (room) {
    room.players.push(player);
  }
}

export const exitRoom = (roomId, playerId) => {
  const room = findRoom(roomId);
  if (room) {
    const index = room.players.findIndex(i => i.id === playerId);
    if (index >= 0) {
      room.players.splice(index, 1)
    }
  }
}

export const update = (sockets) => {
  const room = currentRoom;
  if (room && room.state === 0) {
    const time = moment().diff(room.startTime, 's');
    if (time >= 0) {
      room.state = 'started';
      room.players.map(player => {
        const socket = sockets[player.socketId];
        if (socket) {
          socket.emit("START_GAME", room.id);
        }
      })
    }
  }
}
