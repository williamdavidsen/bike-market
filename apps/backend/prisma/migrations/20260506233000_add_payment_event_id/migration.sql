ALTER TABLE "payment_events" ADD COLUMN "eventId" TEXT;

CREATE UNIQUE INDEX "payment_events_eventId_key" ON "payment_events"("eventId");
