
const User = require('../Models/User');
const Post = require('../Models/Post');

// Escape special regex characters
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const search = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        message: 'Please provide a search query.',
      });
    }

    if (!['all', 'users', 'posts'].includes(type)) {
      return res.status(400).json({
        message: 'Type must be all, users, or posts.',
      });
    }

    const query = new RegExp(escapeRegex(q.trim()), 'i');

    let users = [];
    let posts = [];

    // Search users by username
    if (type === 'all' || type === 'users') {
      users = await User.find({
        username: query,
      })
        .select('username age createdAt')
        .limit(20)
        .lean();
    }

    // Search posts by content
    if (type === 'all' || type === 'posts') {
      posts = await Post.find({
        content: query,
      })
        .limit(20)
        .sort({ createdAt: -1 })
        .lean();
    }

    return res.status(200).json({
      message: 'Search completed successfully.',
      query: q.trim(),
      results: {
        users,
        posts,
      },
    });
  } catch (error) {
    console.error('Search error:', error);

    return res.status(500).json({
      message: 'An error occurred while searching.',
    });
  }
};

module.exports = { search };
