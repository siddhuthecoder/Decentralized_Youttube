import { useEffect } from "react"
import { useMoralis } from "react-moralis"

export default function ManualHeader() {
    const { enableWeb3, isWeb3Enabled, account ,Moralis,deactivateWeb3,isWeb3EnableLoading} = useMoralis()
    useEffect(() => {
        if(isWeb3Enabled) return
        if(typeof window !== "undefined"){
            if(window.localStorage.getItem("connected")){
                enableWeb3()
            }
          }
    }, [isWeb3Enabled]);
    useEffect(()=>{
      Moralis.onAccountChanged((account)=>{
        console.log(`Account Changed to ${account}`);
        if(account==null){
            window.localStorage.removeItem("connected");
            deactivateWeb3();
            console.log("Null Accounts found");
        }
      })
    },[])

    return (
        <>
            {account ? (
                <div>Connected TO {account}</div>
            ) : (
                <button
                     disabled={isWeb3EnableLoading}
                    onClick={async () => {
                        if(typeof window !== "undefined"){
                            window.localStorage.setItem("connected","inject");
                          }
                        await enableWeb3()
                       

                    }}
                >
                    Connect
                </button>
            )}
        </>
    )
}
