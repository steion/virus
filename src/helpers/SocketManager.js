import io from "socket.io-client";

/**
 * @typedef {Object} Answer
 * @property {'success' | 'denied'} status - Статус ответа
 * @property {any} message - Сообщение ответа
 */

// let socket = io();
// socket.removeEventListener
// socket.removeListener

export class SocketManager {
    socket = null;

    static createConnection() {
        if (SocketManager.socket) {
            return;
        }
        
        SocketManager.socket = io("damn", {
            reconnection: true,
            transports: [ 'websocket' ],
            rejectUnauthorized: false
        });
        
        return SocketManager;
    }
    
    /**
     * @param {string} methodName - Имя метода
     * @param {object} params - Параметры метода
     * @returns {Promise<Answer>}
     */
    static async callMethod(methodName, params = {}) {
        const { socket } = SocketManager;

        if (!socket)
            return Promise.resolve({
                status: 'denied',
                message: 'Сокет не подключен'
            });

        return new Promise((resolve) => {
            socket.emit(methodName, params, (answer) => {
                return resolve(answer);
            });
        });
    }
}