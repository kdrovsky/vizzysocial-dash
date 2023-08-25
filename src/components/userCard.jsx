import { ImBin2 } from "react-icons/im";
import { TbRefresh } from "react-icons/tb";
import { countDays, deleteAccount, numFormatter, updateUserProfilePicUrl } from "../helpers";
import avatarImg from "../images/default_user.png"

export default function UserCard({ item, addSuccess, setAddSuccess, from, page }) {
    return (
        <div className="rounded-[4px] border-[#E0E0E0] border border-solid flex justify-between p-3">
            <div className="flex gap-3">
                <img src={item.avatar || avatarImg} className="h-11 w-11 rounded-full self-center" alt={item.account}  />
                <div className="flex flex-col">
                    <h1 className="font-bold font-MontserratBold">@{item.account}</h1>
                    <p className="font-MontserratRegular">{numFormatter(item.followers)} Followers</p>
                    <p className="md:hidden font-MontserratLight">{countDays(item.created_at)}</p>
                </div>
            </div>
            <div className="flex gap-3 items-center">
                <p className="hidden md:flex">{countDays(item.created_at)}</p>
                <div className="flex items-center gap-0">
                    <div className="rounded-[4px] bg-[#D9D9D9] p-2 md:p-3 relative w-8 h-8 md:w-10 md:h-10 md:mr-5 cursor-pointer">
                        <ImBin2 className="text-[#8C8C8C] font-semibold"
                            onClick={async () => {
                                await deleteAccount('targeting', item.id);
                                // const res = 
                                // console.log(res);
                                // console.log(item.id);
                                // await supabase.from('targeting').delete().eq<"id">('id', item.id)
                                setAddSuccess(!addSuccess)
                            }}
                            size={20}
                        />
                    </div>
                    {item && page === 'admin' && <div className="rounded-[4px] bg-[#D9D9D9] p-2 md:p-3 relative w-8 h-8 md:w-10 md:h-10 md:mr-5 cursor-pointer">
                        <TbRefresh className="text-[#8C8C8C] font-semibold cursor-pointer" onClick={async () => {
                            await updateUserProfilePicUrl(item, from)
                            setAddSuccess(!addSuccess)
                        }} 
                        size={20} />
                    </div>}
                </div>
            </div>
        </div>
    )
}