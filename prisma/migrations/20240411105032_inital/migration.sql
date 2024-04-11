-- CreateTable
CREATE TABLE "guild" (
    "id" BIGINT NOT NULL,
    "maximum_announcement_length" SMALLINT NOT NULL DEFAULT 0,
    "maximum_giveable_birthday_roles" SMALLINT NOT NULL DEFAULT 1,
    "maximum_birthday_list_amount" SMALLINT NOT NULL DEFAULT 10,

    CONSTRAINT "guild_pkey" PRIMARY KEY ("id")
);
