import { Server } from "socket.io"
import { Round, listAllRounds } from "./api/round";

export const initSocket = (io: Server) => {
    io.on('connection', async (socket) => {
        console.log("--@ Info: New Socket Connection Established");

        // Get current round history when sockect is connected
        listAllRounds().then((data: Round[] | { err: string }) => {
            if (!(data as { err: string }).err) {
                console.log("--@ Emit: Current GameData");
                socket.emit("round-data", data)
            }
        });

        // Get all current players bets when sockect is connected
        socket.on("get-rounds", () => {
            console.log("--> Received: Get All Round data");
            listAllRounds().then((data: Round[] | { err: string }) => {
                if (!(data as { err: string }).err) {
                    console.log("--@ Emit: Current GameData");
                    socket.emit("round-data", data)
                }
            });
        });

        // Remove old socket id when it is disconnected
        socket.on('disconnect', async () => {
            console.log('--@ Disconnected unknown');
        });
    })
}