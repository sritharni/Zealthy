import { Controller, Get } from "@nestjs/common";

import { jsonOk } from "@/common/http/response";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return jsonOk({
      ok: true,
      service: "zealthy-backend",
      timestamp: new Date().toISOString(),
    });
  }
}
