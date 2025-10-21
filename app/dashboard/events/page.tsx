"use client";
import { Calendar, MapPin, ExternalLink, Users, Clock } from "lucide-react";

const events = [
  {
    id: 12,
    name: "Kaia at EDCON",
    description: "Kaia participation and showcase at EDCON conference",
    url: "https://x.com/BuildonKaia/status/1968976511010050093",
    location: "TBA",
    type: "Conference",
    status: "Completed"
  },
  {
    id: 1,
    name: "Kaia China Tour - Shanghai",
    description: "Join us for an exclusive event in Shanghai as part of the Kaia China Tour",
    url: "https://x.com/buildonkaia/status/1964992105421701215?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "Shanghai, China",
    type: "Tour",
    status: "Completed"
  },
  {
    id: 2,
    name: "Korea Stablecoin Hackathon Offline Event",
    description: "Offline hackathon event focused on stablecoin development in Korea",
    url: "https://x.com/buildonkaia/status/1963195873233678557?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "Korea",
    type: "Hackathon",
    status: "Completed"
  },
  {
    id: 3,
    name: "Akindo Builder Event",
    description: "Builder-focused event organized by Akindo for Kaia ecosystem developers",
    url: "https://x.com/akindo_io/status/1888785065456623989?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "TBA",
    type: "Builder Event",
    status: "Completed"
  },
  {
    id: 4,
    name: "Dorahacks Build Day",
    description: "Build day event organized by Dorahacks for Kaia developers",
    url: "https://x.com/buildonkaia/status/1892091763487391910?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "TBA",
    type: "Build Day",
    status: "Completed"
  },
  {
    id: 5,
    name: "Ngee Ann Polytechnic Clinic Session",
    description: "Educational clinic session at Ngee Ann Polytechnic for students",
    url: "https://x.com/buildonkaia/status/1882637502445719977?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "Singapore",
    type: "Educational",
    status: "Completed"
  },
  {
    id: 6,
    name: "NUS FINTECH SOCIETY",
    description: "Event with National University of Singapore FinTech Society",
    url: "https://x.com/buildonkaia/status/1894731426295394396?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "Singapore",
    type: "University Event",
    status: "Completed"
  },
  {
    id: 7,
    name: "Tokyo Builders Showcase",
    description: "Builder showcase event in Tokyo organized by Akindo",
    url: "https://x.com/akindo_io/status/1957291171648283000?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "Tokyo, Japan",
    type: "Showcase",
    status: "Completed"
  },
  {
    id: 8,
    name: "EthCC",
    description: "Ethereum Community Conference participation and showcase",
    url: "https://x.com/buildonkaia/status/1934551531703198192?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "Brussels, Belgium",
    type: "Conference",
    status: "Completed"
  },
  {
    id: 9,
    name: "Workshop @ Republic Polytechnic Singapore",
    description: "Educational workshop at Republic Polytechnic for students and developers",
    url: "https://x.com/buildonkaia/status/1888233576988295313?s=46&t=fyN9N1cRQVb3au363robMw",
    location: "Singapore",
    type: "Workshop",
    status: "Completed"
  },
  {
    id: 10,
    name: "Kaia Dev Connect with Google Cloud",
    description: "Developer connect event featuring Google Cloud integration and collaboration opportunities",
    url: "https://x.com/BuildonKaia/status/1971033911284400265",
    location: "Singapore",
    type: "Developer Connect",
    status: "Completed"
  },
  {
    id: 11,
    name: "Kaia Summit",
    description: "Major summit event showcasing Kaia ecosystem developments and partnerships",
    url: "https://x.com/i/broadcasts/1OdKrOMXNMYGX",
    location: "Singapore",
    type: "Summit",
    status: "Completed"
  }
];

export default function EventsPage() {
  const eventStats = {
    totalEvents: events.length,
    completedEvents: events.filter(event => event.status === "Completed").length,
    upcomingEvents: events.filter(event => event.status === "Upcoming").length
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-sm text-muted-foreground">
          Past and upcoming Kaia ecosystem events, hackathons, and educational sessions.
        </p>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold">Total Events</h3>
          </div>
          <p className="text-2xl font-bold">{eventStats.totalEvents}</p>
        </div>
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold">Completed</h3>
          </div>
          <p className="text-2xl font-bold">{eventStats.completedEvents}</p>
        </div>
        <div className="flex flex-col gap-2 p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold">Upcoming</h3>
          </div>
          <p className="text-2xl font-bold">{eventStats.upcomingEvents}</p>
        </div>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div key={event.id} className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <h3 className="font-medium text-sm leading-tight">{event.name}</h3>
                <a 
                  href={event.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <p className="text-xs text-muted-foreground">{event.description}</p>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{event.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    event.status === "Completed" 
                      ? "bg-green-100 text-green-800" 
                      : event.status === "Upcoming"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {event.status}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Event Types Summary */}
      <div className="flex flex-col gap-4 border rounded-md p-4">
        <h2 className="text-lg font-semibold">Event Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from(new Set(events.map(event => event.type))).map((type) => {
            const count = events.filter(event => event.type === type).length;
            return (
              <div key={type} className="flex flex-col items-center gap-1 p-3 border rounded-lg">
                <span className="text-sm font-medium">{type}</span>
                <span className="text-xs text-muted-foreground">{count} event{count !== 1 ? 's' : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
