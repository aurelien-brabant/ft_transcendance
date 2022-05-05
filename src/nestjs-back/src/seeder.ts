/*import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SeederService } from './seeder/seeder.service';

async function seed() {
  NestFactory.createApplicationContext(AppModule)
    .then(appContext => {
      const seeder = appContext.get(SeederService);
      seeder
        .seed()
        .catch(error => {
          throw error;
        })
        .finally(() => appContext.close());
    })
    .catch(error => {
      throw error;
    });
}

export default seed;*/

export default null
