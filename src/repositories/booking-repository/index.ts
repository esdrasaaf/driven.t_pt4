import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findUserBooking(userId: number): Promise<Booking> {
    return prisma.booking.findFirst({
        where: { userId }
    });
}

async function createBooking(roomId: number, userId: number) {
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    });
}

async function updateBooking(roomId: number, bookingId: number) {
    
}

async function findBookingByRoomId(roomId: number) {
    return prisma.booking.findMany({
        where: {
            roomId
        }
    })
}

const bookingRepository = {
    findUserBooking,
    createBooking,
    updateBooking,
    findBookingByRoomId
}

export default bookingRepository