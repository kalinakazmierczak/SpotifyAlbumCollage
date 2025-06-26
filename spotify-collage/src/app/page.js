"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session } = useSession();
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState("medium_term");
  const [layout, setLayout] = useState("wall");
  const [theme, setTheme] = useState("dark");
  const [exportSize, setExportSize] = useState("1080 x 1920 (Story)");
  const [contentType, setContentType] = useState("albums"); // 'albums' or 'songs'
  const username = session?.user?.name || "Your";

  const timePeriodOptions = [
    { value: "short_term", label: "Last 4 weeks" },
    { value: "medium_term", label: "Last 6 months" },
    { value: "long_term", label: "Last year" },
  ];

  useEffect(() => {
    if (!session?.accessToken) return;

    setLoading(true);
    const url = `https://api.spotify.com/v1/me/top/tracks?limit=20&time_range=${timePeriod}`;

    fetch(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (contentType === "albums") {
          const albumsMap = new Map();
          for (const track of data.items) {
            const album = track.album;
            if (!albumsMap.has(album.id)) {
              albumsMap.set(album.id, album);
            }
          }
          setTopItems(Array.from(albumsMap.values()).slice(0, 9));
        } else {
          setTopItems(data.items.slice(0, 9));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [session?.accessToken, timePeriod, contentType]);

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center h-screen text-center space-y-4 bg-black text-white">
        <h1 className="font-serif text-6xl font-bold">Spindle</h1>
        <h2 className="font-serif text-4xl" style={{ color: "#5C95FF" }}>
          Spin your story.
        </h2>
        <button
          onClick={() => signIn("spotify")}
          className="font-serif text-lg px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-200 shadow-lg hover:shadow-xl active:scale-95 transform"
        >
          Login with Spotify
        </button>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row items-start justify-center p-8 gap-8 font-serif">
      {/* Customization Controls */}
      <div className="w-full md:w-[400px] space-y-6">
        <h2 className="text-2xl font-bold">Customize Your Vinyl Wall</h2>

        {/* Time Period */}
        <div>
          <label className="block font-semibold mb-2">Time Period</label>
          <div className="flex flex-row gap-2">
            {timePeriodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setTimePeriod(option.value)}
                className={`px-4 py-2 border border-white rounded text-left  hover: transition-colors duration-200 shadow-lg hover:shadow-xl active:scale-95 transform ${
                  timePeriod === option.value
                    ? "bg-white text-black"
                    : "hover:bg-gray-800"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type */}
        <div>
          <label className="block font-semibold mb-1">Content Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => setContentType("albums")}
              className={`px-4 py-2 border border-white rounded ${
                contentType === "albums" ? "bg-white text-black" : ""
              }`}
            >
              Albums
            </button>
            <button
              onClick={() => setContentType("songs")}
              className={`px-4 py-2 border border-white rounded ${
                contentType === "songs" ? "bg-white text-black" : ""
              }`}
            >
              Songs
            </button>
          </div>
        </div>

        

        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => signOut()}
            className="px-6 py-3 bg-red-500 text-white rounded shadow-md hover:bg-red-600"
          >
            Sign Out
          </button>

        </div>
      </div>

      {/* Vinyl Wall */}
      <div className="flex-1 flex justify-center items-start">
        <div
          id="vinyl-wall"
          className="bg-white border border-gray-300 shadow-2xl rounded-lg overflow-hidden"
          style={{
            width: "540px",
            height: "960px",
            transform: "scale(0.9)",
            transformOrigin: "top center",
          }}
        >
          <div className="h-full w-full flex flex-col items-center justify-center p-12">
            {loading ? (
              <div className="text-black text-2xl font-serif">
                Loading your music...
              </div>
            ) : (
              <>
                <div className="text-black text-center mb-8">
                  <h3 className="text-3xl font-serif mb-2">
                    SPINDLE
                  </h3>
                  <h3 className="text-3xl font-serif mb-2">
                    @{username}'s Top {contentType === "albums" ? "Albums" : "Songs"}
                  </h3>
                  <p className="text-lg text-gray-600 font-serif">
                    {
                      timePeriodOptions.find((opt) => opt.value === timePeriod)
                        ?.label
                    }
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-8 max-w-full">
                  {topItems.map((item) => {
                    const imageUrl =
                      contentType === "albums"
                        ? item.images?.[0]?.url
                        : item.album?.images?.[0]?.url;

                    const title = item.name;
                    const artist = item.artists?.[0]?.name;

                    return (
                      <div key={item.id} className="flex flex-col items-center">
                        <div
                          className="relative rounded-full overflow-hidden shadow-2xl hover:animate-spin shadow-3xl transition-all duration-300 hover:scale-105"
                          style={{
                            width: "140px",
                            height: "140px",
                            backgroundImage:
                              "repeating-radial-gradient(circle, #1a1a1a 0px, #1a1a1a 1px, #000 1px, #000 2px)",
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={title}
                              className="absolute top-1/2 left-1/2 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2 border-white shadow-lg"
                              style={{
                                width: "90px",
                                height: "90px",
                              }}
                            />
                          ) : (
                            <div
                              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full border-2 border-white shadow-lg"
                              style={{
                                width: "90px",
                                height: "90px",
                              }}
                            />
                          )}
                          <div
                            className="absolute top-1/2 left-1/2 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 border border-gray-600"
                            style={{
                              width: "12px",
                              height: "12px",
                            }}
                          />
                          <div
                            className="absolute inset-0 rounded-full opacity-20"
                            style={{
                              background:
                                "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                            }}
                          />
                        </div>
                        <div className="text-center mt-3 max-w-[140px]">
                          <p className="text-black text-xs font-semibold font-serif truncate">
                            {title}
                          </p>
                          <p className="text-gray-600 text-xs font-serif truncate">
                            {artist}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
