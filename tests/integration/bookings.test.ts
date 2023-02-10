import app, { init } from "@/app";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import * as jwt from "jsonwebtoken";
import supertest from "supertest";
import {
  createHotel,
  createRoomWithHotelId,
  createUser,
  createTicketTypeRemote,
  createEnrollmentWithAddress,
  createTicket,
  createTicketTypeWithoutHotel,
  createTicketTypeWithHotel,
  createRoomWithHotelIdWithoutCapacity,
} from "../factories";
import { createBooking } from "../factories/bookings-factory";
import { cleanDb, generateValidToken } from "../helpers";

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if user dont have booking", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 with user booking data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.OK);
      expect(response.body).toEqual({
        id: booking.id,
        userId: booking.userId,
        roomId: booking.roomId,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if roomId doesnt exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server
        .post("/booking")
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: room.id + 1 });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if room dont have vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelIdWithoutCapacity(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket is remote", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeRemote();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket dont have hotel", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithoutHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if ticket isnt paid", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, ticketType.id, "RESERVED");

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 201 with bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketTypeWithHotel();
      const enrollment = await createEnrollmentWithAddress(user);
      await createTicket(enrollment.id, ticketType.id, "PAID");

      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: room.id });

      expect(response.status).toEqual(httpStatus.CREATED);
    });
  });
});

describe("PUT /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/1");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 if roomId doesnt exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: room.id + 1 });

      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 if room dont have vacancy", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const newRoom = await createRoomWithHotelIdWithoutCapacity(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 if user dont have bookings", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const newUser = await createUser();
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const newRoom = await createRoomWithHotelIdWithoutCapacity(hotel.id);
      const booking = await createBooking(newUser.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(response.status).toEqual(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 with bookingId", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const newRoom = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server
        .put(`/booking/${booking.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ roomId: newRoom.id });

      expect(response.status).toEqual(httpStatus.OK);
    });
  });
});
