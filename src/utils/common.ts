import figlet from 'figlet';
import { LoggerInstance } from '@utils/logger';

export const displayStartMessage = (port) => {
  figlet('Bot Hunter', function (err, data) {
    if (err) {
      LoggerInstance.error('Something went wrong...');
      LoggerInstance.error(err);
      return;
    }
    console.log(data);
    console.log(`Server started on port ${port}`);
  });
};
