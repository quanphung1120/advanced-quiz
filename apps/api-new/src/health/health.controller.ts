import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("infra")
@Controller()
export class HealthController {
  @Get("health")
  @ApiOperation({ summary: "Health check" })
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  }
}
