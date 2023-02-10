import { AuthenticatedRequest } from "@/middlewares";
import bookingService from "@/services/booking-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  try {
    const booking = await bookingService.findBooking(userId);

    return res.status(httpStatus.OK).send(booking);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body;
  const { userId } = req;

  try {
    const booking = await bookingService.createBooking(roomId, userId);

    return res.status(httpStatus.CREATED).send(`Created one booking, your id is ${booking.id}`);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (error.name === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
  const { bookingId } = req.params;
  const { roomId } = req.body;
  const { userId } = req;

  try {
    await bookingService.putBooking(roomId, Number(bookingId), userId);

    return res.status(httpStatus.OK).send(`Updated one booking, your id is ${bookingId}`);
  } catch (error) {
    if (error.name === "NotFoundError") {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }

    if (error.name === "Forbidden") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
  }
}
