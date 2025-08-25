import type { NextRequest } from "next/server";
import { auth } from "~/server/auth";

export async function GET(req: NextRequest) {
  try {
    const server = await auth(req);
    if (!server) {
      return Response.json({
        status: false,
      }, {
        status: 401,
      });
    }
  } catch (error) {
    console.error("Error in config route: ", error);
    return Response.json(
      {
        status: false,
        reason: "Internal server error",
        code: 4,
        data: {
          error: error,
        },
      },
    );
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