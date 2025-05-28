import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  messages: [
    {
      role: {
        type: String,
        enum: ['system', 'user', 'assistant'],
        required: true
      },
      content: {
        type: String,
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
