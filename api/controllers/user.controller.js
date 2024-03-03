import bcryptjs from 'bcryptjs';
import User from '../models/user.model.js'

export const test = (req, res) => {
    res.json({
        message:"Api route is working!",
    })
}

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.param.id) return (errorHandler(401, "you can only update your own account"))
    try {
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password,10)
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                username: req.body.username, 
                email: req.body.email, 
                password: req.body.password,
                avatar: req.body.avatar,
                
            }
        }, { new: true })
        const { password, ...rest } = updateuser._doc
        res.status(200).json(rest);
    }
    catch(error) {
        next(error);
    }
}
