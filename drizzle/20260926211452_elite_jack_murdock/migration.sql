CREATE TABLE "artist_playlist" (
	"user_id" text,
	"artist_id" text,
	"playlist_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "artist_playlist_pkey" PRIMARY KEY("user_id","artist_id")
);
--> statement-breakpoint
ALTER TABLE "artist_playlist" ADD CONSTRAINT "artist_playlist_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;