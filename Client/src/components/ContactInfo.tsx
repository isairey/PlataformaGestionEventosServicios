import { MdMailOutline, MdOutlineCall } from "react-icons/md";
import { RxMobile } from "react-icons/rx";

function ContactInfo() {
  return (
    <div className="w-full bg-event-navy font-Mainfront">
      <div className="flex justify-between px-[56px] xl:h-[40px] w-full max-w-[1920px] mx-auto">
        {/* Contact Details (Always Visible) */}
        <div className="flex items-center space-x-[12px]">
          <div className="flex items-center space-x-3">
            <MdMailOutline className="w-4 h-4 text-white" />
            <a
              href="mailto:inquiries@certix.ac.lk"
              className="text-xs font-medium text-white font-PlusSans cursor-pointer hover:underline"
            >
              info@eventpro.com
            </a>
          </div>
          <div className="text-white">|</div>
          <div className="flex items-center space-x-3">
            <MdOutlineCall className="w-4 h-4 text-white" />
            <a
              href="tel:+94231234000"
              className="text-xs font-medium text-white font-PlusSans cursor-pointer hover:underline"
            >
              +94 23 123 4567
            </a>
          </div>
          <div className="text-white">|</div>
          <div className="flex items-center space-x-3">
            <RxMobile className="w-4 h-4 text-white rotate-180" />
            <a
              href="tel:+94231234000"
              className="text-xs font-medium text-white font-PlusSans cursor-pointer hover:underline"
            >
              +94 23 123 4567
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactInfo;
