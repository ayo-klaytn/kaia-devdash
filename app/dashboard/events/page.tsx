"use client";
import { Calendar, MapPin, ExternalLink, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

  const statCards = [
    {
      value: eventStats.totalEvents,
      label: "Total Events",
      icon: Calendar,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 dark:bg-blue-950/20",
      gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
    },
    {
      value: eventStats.completedEvents,
      label: "Completed",
      icon: CheckCircle2,
      iconColor: "text-green-600",
      iconBg: "bg-green-50 dark:bg-green-950/20",
      gradient: "from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
    },
    {
      value: eventStats.upcomingEvents,
      label: "Upcoming",
      icon: Clock,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 dark:bg-purple-950/20",
      gradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">
          Past and upcoming Kaia ecosystem events, hackathons, and educational sessions
        </p>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card 
              key={index}
              className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-0 shadow-sm"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`} />
              <CardContent className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{card.label}</p>
                    <h2 className="text-3xl font-bold tracking-tight">{card.value}</h2>
                  </div>
                  <div className={`${card.iconBg} p-3 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">All Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card 
              key={event.id} 
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-sm leading-tight flex-1">{event.name}</h3>
                  <a 
                    href={event.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0 ml-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                <p className="text-xs text-muted-foreground mb-4">{event.description}</p>
                
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{event.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      event.status === "Completed" 
                        ? "bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400" 
                        : event.status === "Upcoming"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {event.status}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400 px-2 py-1 rounded font-medium">
                      {event.type}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Event Types Summary */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Event Types</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from(new Set(events.map(event => event.type))).map((type) => {
              const count = events.filter(event => event.type === type).length;
              return (
                <div 
                  key={type} 
                  className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{type}</span>
                  <span className="text-xs text-muted-foreground">{count} event{count !== 1 ? 's' : ''}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
