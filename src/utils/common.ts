import figlet from 'figlet';
import { LoggerInstance } from '@utils/logger';

export const displayStartMessage = () => {
  figlet('Bot Hunter', function (err, data) {
    if (err) {
      LoggerInstance.error('Something went wrong...');
      LoggerInstance.error(err);
      return;
    }
    console.log(data);
  });
};
