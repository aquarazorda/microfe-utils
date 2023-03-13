import { useCallback, useContext } from "react";
import { EventsContext } from "../events/useEvents";

export const useLanguage = () => {
  const { sendEvent, lang, subscribed } = useContext(EventsContext);

  const t = useCallback((langId: string) => {
    subscribed && sendEvent && !lang?.[langId] && sendEvent!('lang', langId);
    return lang?.[langId] || langId;
  }, [lang, subscribed, sendEvent]);

  return { t }
}