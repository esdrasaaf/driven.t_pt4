import { notFoundError } from "@/errors";
import bookingRepository from "@/repositories/booking-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotel-repository";
import ticketRepository from "@/repositories/ticket-repository";

async function findBooking(userId: number) {
    const booking = await bookingRepository.findUserBooking(userId);

    if(!booking) throw notFoundError();

    return booking
}

async function createBooking(roomId: number, userId: number) {
    const room = await hotelRepository.findRoomsById(roomId);
    if(!room) throw notFoundError();

    const bookings = await bookingRepository.findBookingByRoomId(roomId);
    if(room.capacity <= bookings.length) {
        throw {
            name: "Forbidden",
            message: "We are unable to fulfill this order!",
        }
    };

    const enrollments = await enrollmentRepository.findWithAddressByUserId(userId);

    const userTicket = await ticketRepository.findTicketByEnrollmentId(enrollments.id);
    if (userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel || userTicket.status === "RESERVED") {
        throw {
            name: "Forbidden",
            message: "We are unable to fulfill this order!",
        }
    };

    const result =  await bookingRepository.createBooking(roomId, userId);

    return result
}

async function putBooking(userId: number, hotelId: number) {
    const result =  await bookingRepository.updateBooking(roomId, userId);

    return result
}

const bookingService = {
    findBooking,
    createBooking,
    putBooking
};

export default bookingService;