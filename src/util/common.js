import Moment from 'moment';
export default function TimeFormat(time) {
   const currentDate = Moment().format(Moment.HTML5_FMT.DATE); 
   return Moment(currentDate + ' '+time).format('LT');;
}