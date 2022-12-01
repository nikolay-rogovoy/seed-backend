/**Добавление маршрутов*/
export class AddRoutesError extends Error {
    constructor(public message: string) {
        super(message);
    }
}
