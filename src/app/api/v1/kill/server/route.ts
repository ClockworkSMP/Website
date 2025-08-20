export async function GET(req) {
  return Response.json({
    status: true,
  });
}

/*
Ok: { status: true }

Fail: { status: false, reason: string, method: ("throw" | "kick" | "ban" | "nuke")[] }
*/