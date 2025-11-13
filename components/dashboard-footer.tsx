export function DashboardFooter() {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex items-center justify-center py-6 md:h-16 md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground">
          Made with <span className="text-red-500">❤️</span> by{" "}
          <span className="font-medium text-foreground">DevRel Team</span>
        </p>
      </div>
    </footer>
  );
}

