
//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract DVideo {
  uint public videoCount = 0;
  uint public userCount = 0;

  string public name = "DVideo";

  mapping(uint => Video) public videos;
  mapping(address => User) public users;

  struct Video {
    uint id;
    string hash;
    string title;
    address author;
  }

  struct User {
    uint id;
    string name;
    address userAddress;
    uint[] uploadedVideos;
  }

  event VideoUploaded(
    uint id,
    string hash,
    string title,
    address author
  );

  event UserRegistered(
    uint id,
    string name,
    address userAddress
  );


  function registerUser(string memory _name) public {
    // Make sure the name exists
    require(bytes(_name).length > 0);
    // Make sure the address is not already registered
    require(users[msg.sender].userAddress == address(0));

    // Increment user id
    userCount ++;

    // Add user to the contract
    users[msg.sender] = User(userCount, _name, msg.sender, new uint[](0));
    // Trigger an event
    emit UserRegistered(userCount, _name, msg.sender);
  }

  function uploadVideo(string memory _videoHash, string memory _title) public {
    // Make sure the video hash exists
    require(bytes(_videoHash).length > 0);
    // Make sure video title exists
    require(bytes(_title).length > 0);
    // Make sure uploader is registered
    require(users[msg.sender].userAddress != address(0));

    // Increment video id
    videoCount ++;

    // Add video to the contract
    videos[videoCount] = Video(videoCount, _videoHash, _title, msg.sender);
    // Add video to user's uploaded videos
    users[msg.sender].uploadedVideos.push(videoCount);

    // Trigger an event
    emit VideoUploaded(videoCount, _videoHash, _title, msg.sender);
  }

  function getAllVideos() public view returns (uint[] memory) {
    uint[] memory allVideoIds = new uint[](videoCount);
    for (uint i = 1; i <= videoCount; i++) {
      allVideoIds[i - 1] = i;
    }
    return allVideoIds;
  }

  function getVideoByName(string memory _name) public view returns (uint[] memory) {
    uint[] memory matchingVideoIds = new uint[](videoCount);
    uint count = 0;
    for (uint i = 1; i <= videoCount; i++) {
      if (keccak256(abi.encodePacked(videos[i].title)) == keccak256(abi.encodePacked(_name))) {
        matchingVideoIds[count] = i;
        count++;
      }
    }
    uint[] memory result = new uint[](count);
    for (uint j = 0; j < count; j++) {
      result[j] = matchingVideoIds[j];
    }
    return result;
  }

  function getVideosOfUser(address _userAddress) public view returns (uint[] memory) {
    return users[_userAddress].uploadedVideos;
  }
  function getVideoById(uint _id) public view returns (uint id, string memory hash, string memory title, address author) {
    require(_id > 0 && _id <= videoCount, "Invalid video ID");
    Video storage video = videos[_id];
    return (video.id, video.hash, video.title, video.author);
}

}

