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
    try {

    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST)
    }
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
    try {

    } catch (error) {
      return res.status(httpStatus.BAD_REQUEST)
    }
}
