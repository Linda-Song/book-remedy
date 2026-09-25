import { Calendar } from "@/components/ui/Calendar";
import {
  PRESCRIPTION_DAYS,
  PRESCRIPTION_HISTORY,
} from "../data/prescription_history";

export default function Me() {
  return (
    <div>
      <Calendar prescriptionDays={PRESCRIPTION_DAYS} />
    </div>
  );
}
