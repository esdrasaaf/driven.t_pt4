import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";

async function findBooking(userId: number) {
    const booking = await bookingRepository.findUserBooking(userId);

    if(!booking) throw notFoundError();

    return booking
}

async function createBooking(userId: number) {

}

async function putBooking(userId: number, hotelId: number) {

}

const bookingService = {
    findBooking,
    createBooking,
    putBooking
};

export default bookingService;