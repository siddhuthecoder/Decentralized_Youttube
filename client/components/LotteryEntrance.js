import { contractAddresses, abi } from "../constants"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const { Moralis, isWeb3Enabled, chainId: chainIdHex } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const contractAddress = "0xe3cc2015B4b65698a13ed36Aa85c0397D0c602AF" // Update this with your actual contract address
    const dispatch = useNotification()

    const [videos, setVideos] = useState([])
    const [userName, setUserName] = useState("")
    const [videoHash, setVideoHash] = useState("")
    const [videoTitle, setVideoTitle] = useState("")
    const [searchTitle, setSearchTitle] = useState("")
    const [userAddress, setUserAddress] = useState("")
    const [userVideos, setUserVideos] = useState([])

    const { runContractFunction: getAllVideos } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getAllVideos",
        params: {},
    })

    const { runContractFunction: registerUser } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "registerUser",
        params: { _name: userName },
    })

    const { runContractFunction: uploadVideo } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "uploadVideo",
        params: { _videoHash: videoHash, _title: videoTitle },
    })

    const { runContractFunction: getVideoByName } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getVideoByName",
        params: { _name: searchTitle },
    })

    const { runContractFunction: getVideosOfUser } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "getVideosOfUser",
        params: { _userAddress: userAddress },
    })

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    async function updateUI() {
        const videoIds = await getAllVideos()
        setVideos(videoIds.map(id => id.toNumber()))
        console.log(videoIds);
    }

    async function handleRegisterUser() {
        await registerUser({
            onSuccess: handleSuccess,
            onError: (error) => console.error(error),
        })
    }

    async function handleUploadVideo() {
        await uploadVideo({
            onSuccess: handleSuccess,
            onError: (error) => console.error(error),
        })
    }

    async function handleSearchByTitle() {
        const videoIds = await getVideoByName()
        setVideos(videoIds.map(id => id.toNumber()))
    }

    async function handleSearchByUser() {
        const videoIds = await getVideosOfUser()
        setUserVideos(videoIds.map(id => id.toNumber()))
    }

    const handleSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            position: "topR",
        })
        updateUI()
    }

    return (
        <div className="p-5">
            <div className="grid grid-cols-1 gap-6">
                <div>
                    <input
                        type="text"
                        placeholder="Your UserName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleRegisterUser}
                    >
                        Register
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Video Hash"
                        value={videoHash}
                        onChange={(e) => setVideoHash(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Video Title"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleUploadVideo}
                    >
                        Add Video
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Search Title"
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleSearchByTitle}
                    >
                        Search for a Video
                    </button>
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="User Address"
                        value={userAddress}
                        onChange={(e) => setUserAddress(e.target.value)}
                    />
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={handleSearchByUser}
                    >
                        Search for a User
                    </button>
                </div>
            </div>
            <h1 className="py-4 px-4 font-bold text-3xl">RECENT VIDEOS</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((videoId) => (
                    <VideoCard key={videoId} videoId={videoId} contractAddress={contractAddress} abi={abi} />
                ))}
            </div>
            {userVideos.length > 0 && (
                <>
                    <h1 className="py-4 px-4 font-bold text-3xl">USER VIDEOS</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userVideos.map((videoId) => (
                            <VideoCard key={videoId} videoId={videoId} contractAddress={contractAddress} abi={abi} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

function VideoCard({ videoId, contractAddress, abi }) {
    const [video, setVideo] = useState(null)

    const { runContractFunction: getVideo } = useWeb3Contract({
        abi: abi,
        contractAddress: contractAddress,
        functionName: "videos",
        params: { videoId },
    })

    useEffect(() => {
        async function fetchVideo() {
            const videoData = await getVideo()
            setVideo(videoData)
        }
        fetchVideo()
    }, [videoId])

    if (!video) return <div>Loading...</div>

    return (
        <div className="bg-white shadow-md rounded p-5">
            <p><strong>Video ID:</strong> {video.id.toNumber()}</p>
            <p><strong>Hash:</strong> {video.hash}</p>
            <p><strong>Title:</strong> {video.title}</p>
            <p><strong>Author:</strong> {video.author}</p>
        </div>
    )
}
