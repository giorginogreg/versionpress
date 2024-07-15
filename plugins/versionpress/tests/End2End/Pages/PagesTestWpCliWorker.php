<?php

namespace VersionPress\Tests\End2End\Pages;

use VersionPress\Tests\End2End\Utils\PostTypeTestWpCliWorker;

class PagesTestWpCliWorker extends PostTypeTestWpCliWorker {

    public function getPostType() {
        return "page";
    }

    public function prepare_createTagInEditationForm() {
        throw new \PHPUnit\Framework\SkippedTestError("Pages don't have tags or categories to assign.");
    }

    public function createTagInEditationForm() {
        throw new \PHPUnit\Framework\SkippedTestError("Pages don't have tags or categories to assign.");
    }

    public function prepare_changePostFormat() {
        throw new \PHPUnit\Framework\SkippedTestError("Pages don't have format to assign.");
    }

    public function changePostFormat() {
    }

    public function prepare_deletePostmeta() {
    }

    public function deletePostmeta() {
    }
}
