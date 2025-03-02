const Post = ({ post }) => {
  return (
    <View style={styles.post}>
      <View style={styles.postHeader}>
        <Image 
          source={{ uri: post.userPhoto }} 
          style={styles.userAvatar} 
        />
        <Text style={styles.userName}>{post.userName}</Text>
        <Text style={styles.timestamp}>
          {new Date(post.createdAt).toLocaleString()}
        </Text>
      </View>
      
      <Text style={styles.content}>{post.content}</Text>
      
      {post.mediaUrl && (
        <Image
          source={{ uri: post.mediaUrl }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  post: {
    // ... existing styles ...
  },
  postHeader: {
    // ... existing styles ...
  },
  userAvatar: {
    // ... existing styles ...
  },
  userName: {
    // ... existing styles ...
  },
  timestamp: {
    // ... existing styles ...
  },
  content: {
    // ... existing styles ...
  },
  postImage: {
    width: '100%',
    height: 300,
    marginTop: 10,
    borderRadius: 8
  }
}); 