import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const server = await auth(req);
  if (!server) {
    return Response.json({
      status: false,
    }, {
      status: 401,
    });
  }

  return Response.json({
    status: true,
    data: {
      killswitch: {
        nuke: false,
        kick: false,
        rate: 0,
        reason: "",
      },
      tab: {
        header: {
          everyone: "This is a header",
          players: {}
        },
        footer: {
          everyone: "This is a footer",
          players: {}
        },
        names: {}
      },
      disabledDimensions: ["nether"],
      disabledElytras: ["overworld"],
    }
  })
};