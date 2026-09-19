const User = require("../models/User");
const Course = require("../models/Course");
const Certificate = require("../models/Certificate");
const Portfolio = require("../models/Portfolio");
const TeamMember = require("../models/TeamMember");


// ==========================================
// PUBLIC - ABOUT PAGE
// ==========================================

exports.about = async (req, res) => {

    const startedAt = Date.now();

    try {

        // ==========================================
        // RUN ALL STATISTICS IN PARALLEL
        // ==========================================

        const [
            totalStudents,
            totalCourses,
            totalCertificates,
            totalProjects
        ] = await Promise.all([

            User.countDocuments({
                role: "user"
            }),

            Course.countDocuments(),

            Certificate.countDocuments(),

            Portfolio.countDocuments({
                isPublished: true
            })

        ]);


        // ==========================================
        // GET PUBLISHED TEAM MEMBERS
        // ==========================================

        const teamMembers =
            await TeamMember
                .find({
                    isPublished: true
                })
                .sort({
                    order: 1,
                    createdAt: 1
                })
                .select(
                    "name title experience image linkedin instagram bio order"
                )
                .lean();


        // ==========================================
        // DEBUG
        // ==========================================

        const loadTime =
            Date.now() - startedAt;


        console.log("================================");
        console.log("TECHNOVA ABOUT PAGE");
        console.log("STUDENTS:", totalStudents);
        console.log("COURSES:", totalCourses);
        console.log("CERTIFICATES:", totalCertificates);
        console.log("PROJECTS:", totalProjects);
        console.log("TEAM MEMBERS:", teamMembers.length);
        console.log("ABOUT DB LOAD TIME:", loadTime + " ms");
        console.log("================================");


        // ==========================================
        // RENDER
        // ==========================================

        return res.render(
            "about",
            {
                user:
                    req.session.user || null,

                totalStudents,

                totalCourses,

                totalCertificates,

                totalProjects,

                teamMembers
            }
        );


    } catch (error) {

        console.error(
            "ABOUT PAGE ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to load About page."
        );

    }

};


// ==========================================
// ADMIN - ALL TEAM MEMBERS
// ==========================================

exports.adminTeam = async (req, res) => {

    return res.redirect(
        "/admin/site-settings/about"
    );

    try {

        const [
            teamMembers,
            totalMembers,
            publishedMembers,
            hiddenMembers
        ] = await Promise.all([

            TeamMember
                .find()
                .sort({
                    order: 1,
                    createdAt: 1
                })
                .lean(),

            TeamMember.countDocuments(),

            TeamMember.countDocuments({
                isPublished: true
            }),

            TeamMember.countDocuments({
                isPublished: false
            })

        ]);

        return res.render(
            "admin/team",
            {
                user:
                    req.session.user,

                teamMembers,

                totalMembers,

                publishedMembers,

                hiddenMembers,

                currentPage:
                    "team"
            }
        );


    } catch (error) {

        console.error(
            "ADMIN TEAM ERROR:",
            error
        );


        return res.status(500).send(
            "Unable to load team members."
        );

    }

};


// ==========================================
// ADMIN - ADD TEAM MEMBER PAGE
// ==========================================

exports.showAddTeamMember =
    (req, res) => {

        return res.render(
            "admin/addTeamMember",
            {
                user:
                    req.session.user,

                currentPage:
                    "team"
            }
        );

    };


// ==========================================
// ADMIN - ADD TEAM MEMBER
// ==========================================

exports.addTeamMember =
    async (req, res) => {

        try {

            const {
                name,
                title,
                experience,
                linkedin,
                instagram,
                bio,
                isPublished,
                order
            } = req.body;


            if (
                !name ||
                !title
            ) {

                return res.status(400).send(
                    "Name and title are required."
                );

            }


            await TeamMember.create({

                name,

                title,

                experience:
                    experience || "",

                image:
                    req.file
                        ? req.file.filename
                        : "default-profile.png",

                linkedin:
                    linkedin || "",

                instagram:
                    instagram || "",

                bio:
                    bio || "",

                isPublished:
                    isPublished === "true",

                order:
                    Number(order) || 0

            });


            return res.redirect(
                "/admin/team"
            );


        } catch (error) {

            console.error(
                "ADD TEAM MEMBER ERROR:",
                error
            );


            return res.status(500).send(
                "Unable to add team member."
            );

        }

    };


// ==========================================
// ADMIN - EDIT TEAM MEMBER PAGE
// ==========================================

exports.showEditTeamMember =
    async (req, res) => {

        try {

            const member =
                await TeamMember
                    .findById(
                        req.params.id
                    )
                    .lean();


            if (!member) {

                return res.status(404).send(
                    "Team member not found."
                );

            }


            return res.render(
                "admin/editTeamMember",
                {
                    user:
                        req.session.user,

                    member,

                    currentPage:
                        "team"
                }
            );


        } catch (error) {

            console.error(
                "EDIT TEAM MEMBER PAGE ERROR:",
                error
            );


            return res.status(500).send(
                "Unable to open team member."
            );

        }

    };


// ==========================================
// ADMIN - UPDATE TEAM MEMBER
// ==========================================

exports.updateTeamMember =
    async (req, res) => {

        try {

            const member =
                await TeamMember.findById(
                    req.params.id
                );


            if (!member) {

                return res.status(404).send(
                    "Team member not found."
                );

            }


            const {
                name,
                title,
                experience,
                linkedin,
                instagram,
                bio,
                isPublished,
                order
            } = req.body;


            member.name =
                name;

            member.title =
                title;

            member.experience =
                experience || "";

            member.linkedin =
                linkedin || "";

            member.instagram =
                instagram || "";

            member.bio =
                bio || "";

            member.isPublished =
                isPublished === "true";

            member.order =
                Number(order) || 0;


            if (req.file) {

                member.image =
                    req.file.filename;

            }


            await member.save();


            return res.redirect(
                "/admin/team"
            );


        } catch (error) {

            console.error(
                "UPDATE TEAM MEMBER ERROR:",
                error
            );


            return res.status(500).send(
                "Unable to update team member."
            );

        }

    };


// ==========================================
// ADMIN - DELETE TEAM MEMBER
// ==========================================

exports.deleteTeamMember =
    async (req, res) => {

        try {

            const member =
                await TeamMember.findById(
                    req.params.id
                );


            if (!member) {

                return res.status(404).send(
                    "Team member not found."
                );

            }


            await TeamMember.findByIdAndDelete(
                req.params.id
            );


            return res.redirect(
                "/admin/team"
            );


        } catch (error) {

            console.error(
                "DELETE TEAM MEMBER ERROR:",
                error
            );


            return res.status(500).send(
                "Unable to delete team member."
            );

        }

    };


// ==========================================
// ADMIN - TOGGLE TEAM VISIBILITY
// ==========================================

exports.toggleTeamMember =
    async (req, res) => {

        try {

            const member =
                await TeamMember.findById(
                    req.params.id
                );


            if (!member) {

                return res.status(404).send(
                    "Team member not found."
                );

            }


            member.isPublished =
                !member.isPublished;


            await member.save();


            return res.redirect(
                "/admin/team"
            );


        } catch (error) {

            console.error(
                "TOGGLE TEAM MEMBER ERROR:",
                error
            );


            return res.status(500).send(
                "Unable to update team member status."
            );

        }

    };