import { NextResponse } from "next/server";
import { headers } from 'next/headers';
import { spawn, ChildProcess } from 'child_process';

// Keep track of the running process
let runningProcess: ChildProcess | null = null;

export async function POST(): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret) {
    return NextResponse.json({ error: "No API secret provided" }, { status: 401 });
  }

  if (apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Invalid API secret" }, { status: 401 });
  }

  try {
    // Check if process is already running
    if (runningProcess) {
      return NextResponse.json({ 
        message: "Repository contributors update is already running",
        pid: runningProcess.pid
      });
    }

    // Start the process
    runningProcess = spawn('bun', ['scripts/getContributors.ts'], {
      detached: true,
      stdio: 'ignore'
    });

    // Handle process completion
    runningProcess.on('close', (code: number) => {
      console.log(`Child process exited with code ${code}`);
      runningProcess = null;
    });

    // Handle process errors
    runningProcess.on('error', (err: Error) => {
      console.error('Failed to start child process:', err);
      runningProcess = null;
    });
    
    return NextResponse.json({ 
      message: "Repository contributors update started in background",
      pid: runningProcess.pid
    });
  } catch (error) {
    console.error("Error starting repository contributors update:", error);
    return NextResponse.json({ error: "Failed to start repository contributors update" }, { status: 500 });
  }
}

// Add a new endpoint to check process status
export async function GET(): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret || apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!runningProcess) {
    return NextResponse.json({ status: "not_running" });
  }

  return NextResponse.json({ 
    status: "running",
    pid: runningProcess.pid
  });
}

// Add a new endpoint to kill the process
export async function DELETE(): Promise<NextResponse> {
  const headersList = await headers();
  const apiSecret = headersList.get('apiSecret');

  if (!apiSecret || apiSecret !== process.env.API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!runningProcess) {
    return NextResponse.json({ message: "No process is currently running" });
  }

  try {
    runningProcess.kill();
    runningProcess = null;
    return NextResponse.json({ message: "Process killed successfully" });
  } catch (error) {
    console.error("Error killing process:", error);
    return NextResponse.json({ error: "Failed to kill process" }, { status: 500 });
  }
}