import { prisma } from "@/config";
import { Booking } from "@prisma/client";

async function findUserBooking(userId: number): Promise<Booking> {
    return prisma.booking.findFirst({
        where: { userId }
    });
}

async function createBooking(roomId: number) {
    
}

async function updateBooking(roomId: number, bookingId: number) {
    
}

const bookingRepository = {
    findUserBooking,
    createBooking,
    updateBooking
}

export default bookingRepository